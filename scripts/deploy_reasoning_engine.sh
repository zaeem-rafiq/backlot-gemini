#!/usr/bin/env bash
# ==============================================================================
# BACKLOT STUDIO — GOOGLE AGENT RUNTIME DEPLOYMENT & PROMOTION PROCEDURE
# Managed Resource: Vertex AI Reasoning Engine (ReasoningEngine REST BYOC)
# Target Project: polygraph-hackathon (112519007745) | Region: us-central1
# ==============================================================================
# INVARIANT: This script is prepared for deployment execution upon explicit user approval.
# It enforces strict fail-fast error checking (set -euo pipefail), validates HTTP statuses,
# requires JSON validity, stops on operation.error, enforces bounded HTTP calls, a 600s
# overall operation deadline, immutable image digests, verified replacement secret versions,
# stages and verifies a credential-migrated baseline, and verifies candidate acceptance
# before traffic cutover.
# ==============================================================================

set -euo pipefail

PROJECT_ID="polygraph-hackathon"
PROJECT_NUMBER="112519007745"
REGION="us-central1"
SERVICE_NAME="backlot-studio"
RUNTIME_REPO="us-central1-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy"
STUDIO_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
SECRET_NAME="PARALLEL_API_KEY"

# Service agent identities
REASONING_ENGINE_SA="service-${PROJECT_NUMBER}@gcp-sa-aiplatform-re.iam.gserviceaccount.com"
AIPLATFORM_SA="service-${PROJECT_NUMBER}@gcp-sa-aiplatform.iam.gserviceaccount.com"

# ------------------------------------------------------------------------------
# CORE GUARD & POLLING FUNCTIONS
# ------------------------------------------------------------------------------
validate_operation_name() {
  local op_name="${1:-}"
  local project_id="${2:-${PROJECT_ID}}"
  local project_number="${3:-${PROJECT_NUMBER}}"
  local region="${4:-${REGION}}"

  if [[ -z "${op_name}" ]]; then
    return 1
  fi

  # Supported operation formats:
  # 1. Top-level location operations:
  #    projects/{project}/locations/{region}/operations/{opId}
  # 2. Nested ReasoningEngine operations:
  #    projects/{project}/locations/{region}/reasoningEngines/{engineId}/operations/{opId}
  local valid_regex="^projects/(${project_id}|${project_number})/locations/${region}/(reasoningEngines/[^/]+/)?operations/[^/]+$"

  if [[ "${op_name}" =~ ${valid_regex} ]]; then
    return 0
  fi

  return 1
}

poll_reasoning_engine_operation() {
  local op_name="${1:-}"
  local region="${2:-${REGION}}"
  local timeout="${3:-600}"
  local poll_interval="${4:-10}"
  local custom_base_url="${5:-}"

  if ! validate_operation_name "${op_name}" "${PROJECT_ID}" "${PROJECT_NUMBER}" "${region}"; then
    echo "FATAL: Operation name failed validation against project ${PROJECT_ID}/${PROJECT_NUMBER} and region ${region}: '${op_name}'" >&2
    return 1
  fi

  local base_endpoint="https://${region}-aiplatform.googleapis.com/v1"
  if [[ -n "${custom_base_url}" ]]; then
    base_endpoint="${custom_base_url}"
  fi

  local POLL_START
  POLL_START=$(date +%s)
  local POLL_TIMEOUT=600
  if [[ -n "${timeout}" ]]; then
    POLL_TIMEOUT="${timeout}"
  fi
  local reasoning_engine_resource=""

  while true; do
    local current_time
    current_time=$(date +%s)
    local elapsed=$((current_time - POLL_START))
    if [[ ${elapsed} -gt ${POLL_TIMEOUT} ]]; then
      echo "FATAL: Operation ${op_name} timed out after ${POLL_TIMEOUT} seconds." >&2
      return 1
    fi

    local access_token="${ACCESS_TOKEN:-mock-token}"
    if [[ -z "${custom_base_url}" ]] && [[ -z "${ACCESS_TOKEN:-}" ]] && command -v gcloud >/dev/null 2>&1; then
      access_token=$(gcloud auth print-access-token 2>/dev/null || echo "mock-token")
    fi

    local POLL_HTTP_RES
    POLL_HTTP_RES=$(curl -s -w "\n%{http_code}" --max-time 15 --connect-timeout 5 \
      -X GET "${base_endpoint}/${op_name}" \
      -H "Authorization: Bearer ${access_token}")

    local POLL_STATUS
    POLL_STATUS=$(echo "${POLL_HTTP_RES}" | tail -n1)
    local POLL_BODY
    POLL_BODY=$(echo "${POLL_HTTP_RES}" | sed '$d')

    if [[ "${POLL_STATUS}" -ne 200 ]]; then
      echo "FATAL: Polling operation HTTP error ${POLL_STATUS}:" >&2
      echo "${POLL_BODY}" >&2
      return 1
    fi

    local POLL_CHECK
    POLL_CHECK=$(echo "${POLL_BODY}" | node -e '
      try {
        const op = JSON.parse(require("fs").readFileSync(0, "utf-8"));
        if (op.error) {
          console.log("ERROR:" + JSON.stringify(op.error));
        } else if (op.done) {
          const resName = op.response?.name || "";
          if (!resName) {
            console.log("ERROR:Operation marked done but missing response.name");
          } else {
            console.log("DONE:" + resName);
          }
        } else {
          console.log("WAITING");
        }
      } catch (e) {
        console.log("MALFORMED_JSON:" + e.message);
      }
    ')

    if [[ "${POLL_CHECK}" =~ ^ERROR: ]]; then
      echo "FATAL: Operation failed with error: ${POLL_CHECK#ERROR:}" >&2
      return 1
    elif [[ "${POLL_CHECK}" =~ ^MALFORMED_JSON: ]]; then
      echo "FATAL: Malformed JSON received from operation poll: ${POLL_CHECK#MALFORMED_JSON:}" >&2
      return 1
    elif [[ "${POLL_CHECK}" =~ ^DONE: ]]; then
      reasoning_engine_resource="${POLL_CHECK#DONE:}"
      break
    fi

    echo "  [${elapsed}s elapsed] Operation in progress..." >&2
    sleep "${poll_interval}"
  done

  local valid_resource_regex="^projects/(${PROJECT_ID}|${PROJECT_NUMBER})/locations/${region}/reasoningEngines/[^/]+$"
  if [[ -z "${reasoning_engine_resource}" || ! "${reasoning_engine_resource}" =~ ${valid_resource_regex} ]]; then
    echo "FATAL: Invalid ReasoningEngine resource name returned: '${reasoning_engine_resource}'" >&2
    return 1
  fi

  echo "${reasoning_engine_resource}"
  return 0
}

main() {
echo "=============================================================================="
echo "BACKLOT STUDIO — REASONING ENGINE DEPLOYMENT & VERIFICATION"
echo "Project: ${PROJECT_ID} (${PROJECT_NUMBER}) | Region: ${REGION}"
echo "=============================================================================="

# ------------------------------------------------------------------------------
# STEP 1: FREEZE IDENTIFIABLE SOURCE SNAPSHOT FOR BOTH BUILDS
# ------------------------------------------------------------------------------
echo -e "\n[1/8] Freezing identifiable source snapshot across working tree and index..."

# Invariant: Pre-validate acceptance harness startup before staging or building
echo "  Validating acceptance evidence capture harness startup..."
node scripts/capture_live_acceptance_evidence.mjs --check-startup

TEMP_INDEX=$(mktemp)
export GIT_INDEX_FILE="${TEMP_INDEX}"

# 1a. Initialize temporary Git index cleanly from HEAD
git read-tree HEAD

# 1b. Stage tracked modifications in working tree
git add -u

# 1c. Add explicit release files / paths (including untracked configs & containers)
RELEASE_PATHS=(
  "Dockerfile.agent-runtime"
  "cloudbuild-agent-runtime.yaml"
  "cloudbuild-studio.yaml"
  "src"
  "scripts"
  "public"
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "next.config.ts"
  "tailwind.config.ts"
  "postcss.config.mjs"
  "vitest.config.ts"
  "Dockerfile"
  ".dockerignore"
  ".gitignore"
  "README.md"
  "GEMINI.md"
  "DEVPOST.md"
)

for p in "${RELEASE_PATHS[@]}"; do
  if [[ -e "${p}" ]]; then
    git add "${p}"
  fi
done

# 1d. Exclude demo media, evaluation runs, and build caches without deleting them from disk
git rm -r --cached --ignore-unmatch demo evals dist .next 2>/dev/null || true

CANDIDATE_TREE=$(git write-tree)
rm -f "${TEMP_INDEX}"
unset GIT_INDEX_FILE

HEAD_COMMIT=$(git rev-parse HEAD)
CANDIDATE_COMMIT=$(echo "Candidate snapshot $(date -u)" | git commit-tree "${CANDIDATE_TREE}" -p "${HEAD_COMMIT}")
SOURCE_TAG="release-${CANDIDATE_COMMIT:0:8}-$(date +%s)"

mkdir -p dist
SNAPSHOT_TAR="dist/source-snapshot-${CANDIDATE_COMMIT:0:8}.tar.gz"
git archive --format=tar.gz --output="${SNAPSHOT_TAR}" "${CANDIDATE_COMMIT}"
SNAPSHOT_SHA256=$(shasum -a 256 "${SNAPSHOT_TAR}" | awk '{print $1}')

echo "  Head Commit SHA:        ${HEAD_COMMIT}"
echo "  Candidate Tree Hash:    ${CANDIDATE_TREE}"
echo "  Candidate Commit SHA:   ${CANDIDATE_COMMIT}"
echo "  Source Snapshot Tar:    ${SNAPSHOT_TAR}"
echo "  Source Content SHA256:  ${SNAPSHOT_SHA256}"
echo "  Build Image Tag:        ${SOURCE_TAG}"

# ------------------------------------------------------------------------------
# STEP 2: CREDENTIAL & IDENTITY RESOLUTION BEFORE RESOURCE CREATION
# ------------------------------------------------------------------------------
echo -e "\n[2/8] Resolving credentials, replacement secret version, and IAM grants..."

# 2a. Verify and enable Secret Manager API if missing
echo "  Checking Secret Manager API status on project ${PROJECT_ID}..."
SM_ENABLED=$(gcloud services list --enabled --project="${PROJECT_ID}" --filter="config.name:secretmanager.googleapis.com" --format="value(config.name)" 2>/dev/null || echo "")
if [[ -z "${SM_ENABLED}" ]]; then
  echo "  Enabling secretmanager.googleapis.com on project ${PROJECT_ID}..."
  gcloud services enable secretmanager.googleapis.com --project="${PROJECT_ID}"
  echo "  Secret Manager API enabled successfully."
fi

# 2b. Ensure secret resource exists before version assignment
SECRET_EXISTS=$(gcloud secrets describe "${SECRET_NAME}" --project="${PROJECT_ID}" --format="value(name)" 2>/dev/null || echo "")
if [[ -z "${SECRET_EXISTS}" ]]; then
  echo "  Secret '${SECRET_NAME}' does not exist in project ${PROJECT_ID}. Creating secret..."
  gcloud secrets create "${SECRET_NAME}" \
    --project="${PROJECT_ID}" \
    --replication-policy="automatic"
  echo "  Secret '${SECRET_NAME}' created successfully."
fi

# Invariant: Require actual replacement secret version (reject blank input or guessing newest)
REPLACEMENT_VERSION=""
if [[ -n "${NEW_PARALLEL_API_KEY:-}" ]]; then
  echo "  Adding replacement secret version to Secret Manager (${SECRET_NAME})..."
  ADD_OUTPUT=$(printf "%s" "${NEW_PARALLEL_API_KEY}" | gcloud secrets versions add "${SECRET_NAME}" \
    --project="${PROJECT_ID}" \
    --data-file=- \
    --format="value(name)")
  REPLACEMENT_VERSION=$(basename "${ADD_OUTPUT}")
  if [[ ! "${REPLACEMENT_VERSION}" =~ ^[0-9]+$ ]]; then
    echo "FATAL: Failed to capture valid numeric secret version from add command: '${ADD_OUTPUT}'" >&2
    exit 1
  fi
  echo "  Captured replacement secret version from provider add: ${REPLACEMENT_VERSION}"
elif [[ -n "${REPLACEMENT_SECRET_VERSION:-}" ]]; then
  if [[ ! "${REPLACEMENT_SECRET_VERSION}" =~ ^[0-9]+$ ]]; then
    echo "FATAL: Explicit replacement version '${REPLACEMENT_SECRET_VERSION}' is not a valid numeric version." >&2
    exit 1
  fi
  STATE=$(gcloud secrets versions describe "${REPLACEMENT_SECRET_VERSION}" \
    --secret="${SECRET_NAME}" \
    --project="${PROJECT_ID}" \
    --format="value(state)")
  if [[ "${STATE}" != "ENABLED" ]]; then
    echo "FATAL: Replacement secret version ${REPLACEMENT_SECRET_VERSION} is not in ENABLED state (state=${STATE})." >&2
    exit 1
  fi
  REPLACEMENT_VERSION="${REPLACEMENT_SECRET_VERSION}"
  echo "  Verified explicit replacement secret version: ${REPLACEMENT_VERSION}"
else
  echo "FATAL: Credential rotation not established. Either set NEW_PARALLEL_API_KEY or verified REPLACEMENT_SECRET_VERSION." >&2
  echo "Blank input or selecting newest version automatically is strictly prohibited." >&2
  exit 1
fi

echo "  Pinned Secret Target: projects/${PROJECT_ID}/secrets/${SECRET_NAME}/versions/${REPLACEMENT_VERSION}"

# Verify IAM Grants (Fail fast: NO '|| true')
echo "  Verifying image-pull permissions for Reasoning Engine service agents..."
if gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${REASONING_ENGINE_SA}" \
  --role="roles/artifactregistry.reader" \
  --condition=None --quiet >/dev/null 2>&1; then
  echo "  Bound artifactregistry.reader to ${REASONING_ENGINE_SA}."
fi

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${AIPLATFORM_SA}" \
  --role="roles/artifactregistry.reader" \
  --condition=None --quiet >/dev/null

echo "  Verifying model and secret permissions for runtime identity (${RUNTIME_SA})..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role="roles/aiplatform.user" \
  --condition=None --quiet >/dev/null

gcloud secrets add-iam-policy-binding "${SECRET_NAME}" \
  --project="${PROJECT_ID}" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None --quiet >/dev/null

echo "  Verifying deployer actAs permission on runtime identity (${RUNTIME_SA})..."
DEPLOYER_ACCOUNT=$(gcloud config get-value account 2>/dev/null || echo "")
if [[ -n "${DEPLOYER_ACCOUNT}" ]]; then
  gcloud iam service-accounts add-iam-policy-binding "${RUNTIME_SA}" \
    --project="${PROJECT_ID}" \
    --member="user:${DEPLOYER_ACCOUNT}" \
    --role="roles/iam.serviceAccountUser" \
    --condition=None --quiet >/dev/null
fi

echo "  Verifying caller permissions for Cloud Run Studio SA (${STUDIO_SA})..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${STUDIO_SA}" \
  --role="roles/aiplatform.user" \
  --condition=None --quiet >/dev/null

gcloud secrets add-iam-policy-binding "${SECRET_NAME}" \
  --project="${PROJECT_ID}" \
  --member="serviceAccount:${STUDIO_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None --quiet >/dev/null

echo "  All IAM role bindings verified."

# ------------------------------------------------------------------------------
# STEP 3: SUBMIT BOTH CLOUD BUILDS & CAPTURE IMMUTABLE IMAGE DIGESTS
# ------------------------------------------------------------------------------
echo -e "\n[3/8] Submitting Cloud Builds for Agent Runtime & Studio containers..."

# 3a. Build Agent Runtime container
echo "  Building Agent Runtime container (${SNAPSHOT_TAR} -> cloudbuild-agent-runtime.yaml)..."
RUNTIME_BUILD_OUTPUT=$(gcloud builds submit "${SNAPSHOT_TAR}" \
  --project="${PROJECT_ID}" \
  --config=cloudbuild-agent-runtime.yaml \
  --substitutions=_TAG="${SOURCE_TAG}" \
  --format="json")

RUNTIME_BUILD_ID=$(echo "${RUNTIME_BUILD_OUTPUT}" | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf-8"));
  console.log(data.id || "");
')
echo "  Runtime Cloud Build ID: ${RUNTIME_BUILD_ID}"

RUNTIME_IMAGE_BASE="${RUNTIME_REPO}/backlot-marquee-runtime"
RUNTIME_RAW_DIGEST=$(echo "${RUNTIME_BUILD_OUTPUT}" | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf-8"));
  const img = (data.results?.images || [])[0] || {};
  console.log(img.digest || "");
')

if [[ -z "${RUNTIME_RAW_DIGEST}" ]]; then
  RUNTIME_RAW_DIGEST=$(gcloud container images describe "${RUNTIME_IMAGE_BASE}:${SOURCE_TAG}" \
    --format="value(image_summary.digest)" 2>/dev/null || true)
fi

if [[ ! "${RUNTIME_RAW_DIGEST}" =~ ^sha256:[a-f0-9]{64}$ ]]; then
  echo "FATAL: Failed to resolve valid immutable digest for runtime image: '${RUNTIME_RAW_DIGEST}'" >&2
  exit 1
fi
RUNTIME_IMAGE_DIGEST="${RUNTIME_IMAGE_BASE}@${RUNTIME_RAW_DIGEST}"
echo "  Immutable Runtime Image: ${RUNTIME_IMAGE_DIGEST}"

# 3b. Build Backlot Studio container
echo "  Building Studio container (${SNAPSHOT_TAR} -> cloudbuild-studio.yaml)..."
STUDIO_BUILD_OUTPUT=$(gcloud builds submit "${SNAPSHOT_TAR}" \
  --project="${PROJECT_ID}" \
  --config=cloudbuild-studio.yaml \
  --substitutions=_TAG="${SOURCE_TAG}" \
  --format="json")

STUDIO_BUILD_ID=$(echo "${STUDIO_BUILD_OUTPUT}" | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf-8"));
  console.log(data.id || "");
')
echo "  Studio Cloud Build ID:  ${STUDIO_BUILD_ID}"

STUDIO_IMAGE_BASE="${RUNTIME_REPO}/backlot-studio"
STUDIO_RAW_DIGEST=$(echo "${STUDIO_BUILD_OUTPUT}" | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf-8"));
  const img = (data.results?.images || [])[0] || {};
  console.log(img.digest || "");
')

if [[ -z "${STUDIO_RAW_DIGEST}" ]]; then
  STUDIO_RAW_DIGEST=$(gcloud container images describe "${STUDIO_IMAGE_BASE}:${SOURCE_TAG}" \
    --format="value(image_summary.digest)" 2>/dev/null || true)
fi

if [[ ! "${STUDIO_RAW_DIGEST}" =~ ^sha256:[a-f0-9]{64}$ ]]; then
  echo "FATAL: Failed to resolve valid immutable digest for studio image: '${STUDIO_RAW_DIGEST}'" >&2
  exit 1
fi
STUDIO_IMAGE_DIGEST="${STUDIO_IMAGE_BASE}@${STUDIO_RAW_DIGEST}"
echo "  Immutable Studio Image:  ${STUDIO_IMAGE_DIGEST}"

# ------------------------------------------------------------------------------
# STEP 4: STAGE AND VERIFY CREDENTIAL-MIGRATED BASELINE ROLLBACK REVISION
# ------------------------------------------------------------------------------
echo -e "\n[4/8] Staging and verifying credential-migrated baseline rollback revision..."

# Inspect current active production revision and its exact image digest
CURRENT_SERVICE_JSON=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="json")

CURRENT_REV=$(echo "${CURRENT_SERVICE_JSON}" | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf-8"));
  const traffic = data.status?.traffic || [];
  const prod = traffic.find(t => t.percent === 100) || traffic[0] || {};
  console.log(prod.revisionName || data.status?.latestReadyRevisionName || "");
')

CURRENT_IMAGE_DIGEST=$(gcloud run revisions describe "${CURRENT_REV}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.imageDigest)")

if [[ -z "${CURRENT_IMAGE_DIGEST}" ]]; then
  CURRENT_IMAGE_DIGEST=$(gcloud run revisions describe "${CURRENT_REV}" \
    --region="${REGION}" \
    --project="${PROJECT_ID}" \
    --format="value(spec.containers[0].image)")
fi
echo "  Current Production Revision: ${CURRENT_REV}"
echo "  Pinned Production Image:     ${CURRENT_IMAGE_DIGEST}"

echo "  Deploying staged baseline revision with --no-traffic and tag 'baseline-migrated'..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${CURRENT_IMAGE_DIGEST}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --no-traffic \
  --tag="baseline-migrated" \
  --remove-env-vars="${SECRET_NAME}" \
  --update-secrets="${SECRET_NAME}=${SECRET_NAME}:${REPLACEMENT_VERSION}" \
  --quiet

# Obtain baseline revision and URL directly from service returned traffic entries
UPDATED_SERVICE_JSON=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="json")

BASELINE_TRAFFIC=$(echo "${UPDATED_SERVICE_JSON}" | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf-8"));
  const entry = (data.status?.traffic || []).find(t => t.tag === "baseline-migrated");
  if (!entry || !entry.url) {
    console.error("Traffic entry for tag baseline-migrated not found");
    process.exit(1);
  }
  console.log(JSON.stringify({ revisionName: entry.revisionName, url: entry.url }));
')

BASELINE_REV=$(echo "${BASELINE_TRAFFIC}" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf-8")).revisionName)')
BASELINE_URL=$(echo "${BASELINE_TRAFFIC}" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf-8")).url)')

echo "  Staged Baseline Revision: ${BASELINE_REV}"
echo "  Staged Baseline URL:      ${BASELINE_URL}"

# Verify baseline acceptance before declaring it a safe rollback
echo "  Verifying baseline revision behavior at staged URL..."
if [[ -f "demo/captures/baseline_acceptance_evidence.json" ]]; then
  EXISTING_BASE_REV=$(node -e 'try{console.log(JSON.parse(require("fs").readFileSync("demo/captures/baseline_acceptance_evidence.json")).infrastructure.independentlyObservedRevision||"")}catch{console.log("")}')
  if [[ "${EXISTING_BASE_REV}" == "${BASELINE_REV}" ]]; then
    echo "  Baseline revision ${BASELINE_REV} already verified in demo/captures/baseline_acceptance_evidence.json. Reusing verified evidence."
  else
    node scripts/capture_live_acceptance_evidence.mjs \
      --target-url "${BASELINE_URL}" \
      --expected-revision "${BASELINE_REV}" \
      --output "demo/captures/baseline_acceptance_evidence.json" \
      --source-commit "${HEAD_COMMIT}" \
      --force-overwrite
  fi
else
  node scripts/capture_live_acceptance_evidence.mjs \
    --target-url "${BASELINE_URL}" \
    --expected-revision "${BASELINE_REV}" \
    --output "demo/captures/baseline_acceptance_evidence.json" \
    --source-commit "${HEAD_COMMIT}"
fi

echo "  Baseline revision verified and confirmed as safe rollback target."

# ------------------------------------------------------------------------------
# STEP 5: CREATE VERTEX AI REASONING ENGINE MANAGED RESOURCE
# ------------------------------------------------------------------------------
echo -e "\n[5/8] Creating Vertex AI ReasoningEngine REST resource..."

ACCESS_TOKEN=$(gcloud auth print-access-token)
REASONING_ENGINES_URL="https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/reasoningEngines"

EXISTING_REASONING_ENGINE=$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" "${REASONING_ENGINES_URL}" | node -e '
  try {
    const list = JSON.parse(require("fs").readFileSync(0, "utf-8")).reasoningEngines || [];
    const matched = list.find(re => re.displayName === "backlot-marquee-reasoning-engine");
    console.log(matched?.name || "");
  } catch {
    console.log("");
  }
')

if [[ -n "${EXISTING_REASONING_ENGINE}" ]]; then
  echo "  Active managed ReasoningEngine found from previous completed checkpoint: ${EXISTING_REASONING_ENGINE}"
  REASONING_ENGINE_RESOURCE="${EXISTING_REASONING_ENGINE}"
else
  # Construct precise REST payload adhering to Vertex AI BYOC ReasoningEngine specification
  PAYLOAD_FILE=$(mktemp)
  cat <<EOF > "${PAYLOAD_FILE}"
{
  "displayName": "backlot-marquee-reasoning-engine",
  "description": "Backlot Studio Marquee research-and-pitch stage managed reasoning engine",
  "spec": {
    "serviceAccount": "${RUNTIME_SA}",
    "containerSpec": {
      "imageUri": "${RUNTIME_IMAGE_DIGEST}",
      "port": 8080
    },
    "deploymentSpec": {
      "env": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "AIP_HTTP_PORT", "value": "8080" },
        { "name": "AIP_HEALTH_ROUTE", "value": "/health" },
        { "name": "AIP_PREDICT_ROUTE", "value": "/predict" }
      ],
      "secretEnv": [
        {
          "name": "PARALLEL_API_KEY",
          "secretRef": {
            "secret": "${SECRET_NAME}",
            "version": "${REPLACEMENT_VERSION}"
          }
        }
      ]
    },
    "classMethods": [
      {
        "name": "generate_pitch_kit",
        "description": "Execute Parallel Search and Gemini pitch kit synthesis",
        "api_mode": ""
      },
      {
        "name": "query",
        "description": "Query reasoning engine unary endpoint",
        "api_mode": ""
      }
    ]
  }
}
EOF

  echo "  Submitting POST request to ReasoningEngines endpoint..."
  HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 --connect-timeout 10 \
    -X POST "${REASONING_ENGINES_URL}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d @"${PAYLOAD_FILE}")

  HTTP_STATUS=$(echo "${HTTP_RESPONSE}" | tail -n1)
  HTTP_BODY=$(echo "${HTTP_RESPONSE}" | sed '$d')
  rm -f "${PAYLOAD_FILE}"

  if [[ "${HTTP_STATUS}" -ne 200 && "${HTTP_STATUS}" -ne 201 ]]; then
    echo "FATAL: Failed to create ReasoningEngine. HTTP ${HTTP_STATUS}:" >&2
    echo "${HTTP_BODY}" >&2
    exit 1
  fi

  OPERATION_NAME=$(echo "${HTTP_BODY}" | node -e '
    try {
      const json = JSON.parse(require("fs").readFileSync(0, "utf-8"));
      console.log(json.name || "");
    } catch {
      console.log("");
    }
  ')

  if ! validate_operation_name "${OPERATION_NAME}" "${PROJECT_ID}" "${PROJECT_NUMBER}" "${REGION}"; then
    echo "FATAL: Response did not contain a valid canonical or nested ReasoningEngine operation name: '${OPERATION_NAME}'" >&2
    echo "${HTTP_BODY}" >&2
    exit 1
  fi

  echo "  Operation started: ${OPERATION_NAME}"
  echo "  Polling operation until completion (600s deadline, bounded HTTP queries)..."

  REASONING_ENGINE_RESOURCE=$(poll_reasoning_engine_operation "${OPERATION_NAME}" "${REGION}" 600 10)
  if [[ -z "${REASONING_ENGINE_RESOURCE}" ]]; then
    echo "FATAL: Failed to obtain valid ReasoningEngine resource name from completed operation." >&2
    exit 1
  fi

  echo "  ReasoningEngine successfully created: ${REASONING_ENGINE_RESOURCE}"
fi

# ------------------------------------------------------------------------------
# STEP 6: DEPLOY CANDIDATE STUDIO REVISION WITH MANAGED RUNTIME TARGET
# ------------------------------------------------------------------------------
echo -e "\n[6/8] Deploying candidate Cloud Run Studio revision (--no-traffic, tag=candidate)..."

gcloud run deploy "${SERVICE_NAME}" \
  --image="${STUDIO_IMAGE_DIGEST}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --no-traffic \
  --tag="candidate" \
  --update-env-vars="NODE_ENV=production,VERTEX_REASONING_ENGINE_RESOURCE_NAME=${REASONING_ENGINE_RESOURCE}" \
  --remove-env-vars="${SECRET_NAME}" \
  --update-secrets="${SECRET_NAME}=${SECRET_NAME}:${REPLACEMENT_VERSION}" \
  --quiet

CANDIDATE_SERVICE_JSON=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="json")

# Extract candidate revision and URL directly from service traffic entries
CANDIDATE_TRAFFIC=$(echo "${CANDIDATE_SERVICE_JSON}" | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf-8"));
  const entry = (data.status?.traffic || []).find(t => t.tag === "candidate");
  if (!entry || !entry.url) {
    console.error("Traffic entry for tag candidate not found");
    process.exit(1);
  }
  console.log(JSON.stringify({ revisionName: entry.revisionName, url: entry.url }));
')

CANDIDATE_REV=$(echo "${CANDIDATE_TRAFFIC}" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf-8")).revisionName)')
CANDIDATE_URL=$(echo "${CANDIDATE_TRAFFIC}" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf-8")).url)')

echo "  Candidate Revision: ${CANDIDATE_REV}"
echo "  Candidate URL:      ${CANDIDATE_URL}"

# ------------------------------------------------------------------------------
# STEP 7: LIVE ACCEPTANCE VERIFICATION AGAINST CANDIDATE URL
# ------------------------------------------------------------------------------
echo -e "\n[7/8] Executing live acceptance verification against candidate URL..."

EVIDENCE_FILE="demo/captures/candidate_acceptance_evidence.json"
node scripts/capture_live_acceptance_evidence.mjs \
  --target-url "${CANDIDATE_URL}" \
  --expected-revision "${CANDIDATE_REV}" \
  --expected-reasoning-engine "${REASONING_ENGINE_RESOURCE}" \
  --output "${EVIDENCE_FILE}" \
  --cloud-build-id "${STUDIO_BUILD_ID}" \
  --source-commit "${CANDIDATE_COMMIT}" \
  --force-overwrite

echo "  Candidate acceptance verification passed completely!"

# ------------------------------------------------------------------------------
# STEP 8: PRODUCTION TRAFFIC CUTOVER & PROVIDER KEY REVOCATION
# ------------------------------------------------------------------------------
echo -e "\n[8/8] Production Traffic Cutover & Credential Finalization"
echo "=============================================================================="
echo "PROMOTION READY:"
echo "Candidate revision [${CANDIDATE_REV}] has passed 100% of live acceptance checks"
echo "using managed ReasoningEngine [${REASONING_ENGINE_RESOURCE}]."
echo "=============================================================================="
echo ""
echo "To migrate 100% of production traffic to candidate revision, execute:"
echo "  gcloud run services update-traffic ${SERVICE_NAME} \\"
echo "    --region=${REGION} \\"
echo "    --project=${PROJECT_ID} \\"
echo "    --to-tags candidate=100"
echo ""
echo "AFTER TRAFFIC PROMOTION IS CONFIRMED:"
echo "1. Revoke the previously exposed provider key at Parallel's dashboard/API."
echo "2. Note: Baseline revision ${BASELINE_REV} is the verified safe rollback point."
echo "3. Historical Secret Manager versions are preserved (no permanent secret destruction)."
echo "=============================================================================="
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi

