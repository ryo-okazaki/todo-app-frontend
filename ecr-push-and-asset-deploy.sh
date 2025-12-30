#!/usr/bin/env bash
#
# Usage:
#   ./push-ecr-and-deploy-assets.sh --profile <AWS_PROFILE>
#       [--region <AWS_REGION>]
#       [--platform <DOCKER_PLATFORM>]
#       [--tag <IMAGE_TAG>]
#       [--asset-prefix <URL>]
#       [--app-dir <CONTAINER_APP_DIR>]
#       [--bucket-key <KEYWORD>]
#       [--cf-comment <CLOUDFRONT_COMMENT>]
#       [--skip-assets]
#       [--skip-invalidation]
#
# Example:
#   ./push-ecr-and-deploy-assets.sh --profile todo-app-develop-admin
#   ./push-ecr-and-deploy-assets.sh --profile todo-app-develop-admin --asset-prefix https://cdn.dev.todo-app.ryo-okazaki.com --tag latest
#
set -euo pipefail

AWS_PROFILE=""
AWS_REGION="ap-northeast-1"
DOCKER_PLATFORM="linux/amd64"
IMAGE_TAG="latest"

ASSET_PREFIX=""
CONTAINER_APP_DIR="/app"

# S3 bucket discovery keyword (e.g. static-assets)
BUCKET_KEY="static-assets"

# CloudFront distribution discovery comment
CF_COMMENT="Static Assets Distribution"

SKIP_ASSETS="false"
SKIP_INVALIDATION="false"

usage() {
  cat <<'EOF'
Usage:
  ./push-ecr-and-deploy-assets.sh --profile <AWS_PROFILE>
      [--region <AWS_REGION>]
      [--platform <DOCKER_PLATFORM>]
      [--tag <IMAGE_TAG>]
      [--asset-prefix <URL>]
      [--app-dir <CONTAINER_APP_DIR>]
      [--bucket-key <KEYWORD>]
      [--cf-comment <CLOUDFRONT_COMMENT>]
      [--skip-assets]
      [--skip-invalidation]

Options:
  --profile            AWS CLI profile name (required)
  --region             AWS region (default: ap-northeast-1)
  --platform           Docker build platform (default: linux/amd64)
  --tag                Docker image tag (default: latest)
  --asset-prefix       Build arg NEXT_PUBLIC_ASSET_PREFIX (optional)
  --app-dir            App directory inside the container (default: /app)
  --bucket-key         Keyword to find S3 bucket name (default: static-assets)
  --cf-comment         CloudFront distribution comment to find target (default: Static Assets Distribution)
  --skip-assets        Skip assets extraction + S3 sync (push image only)
  --skip-invalidation  Skip CloudFront invalidation

Example:
  ./push-ecr-and-deploy-assets.sh --profile todo-app-develop-admin
  ./push-ecr-and-deploy-assets.sh --profile todo-app-develop-admin --asset-prefix https://cdn.dev.todo-app.ryo-okazaki.com --tag latest
EOF
}

die() {
  echo "ERROR: $*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)           AWS_PROFILE="${2:-}"; shift 2 ;;
    --region)            AWS_REGION="${2:-}"; shift 2 ;;
    --platform)          DOCKER_PLATFORM="${2:-}"; shift 2 ;;
    --tag)               IMAGE_TAG="${2:-}"; shift 2 ;;
    --asset-prefix)      ASSET_PREFIX="${2:-}"; shift 2 ;;
    --app-dir)           CONTAINER_APP_DIR="${2:-}"; shift 2 ;;
    --bucket-key)        BUCKET_KEY="${2:-}"; shift 2 ;;
    --cf-comment)        CF_COMMENT="${2:-}"; shift 2 ;;
    --skip-assets)       SKIP_ASSETS="true"; shift 1 ;;
    --skip-invalidation) SKIP_INVALIDATION="true"; shift 1 ;;
    -h|--help)           usage; exit 0 ;;
    *)                   die "Unknown argument: $1 (use --help)" ;;
  esac
done

[[ -n "${AWS_PROFILE}" ]] || { usage; die "--profile is required."; }

command -v aws >/dev/null 2>&1 || die "aws CLI is not installed."
command -v docker >/dev/null 2>&1 || die "docker is not installed."

echo "Validating AWS credentials..."
aws sts get-caller-identity --profile "${AWS_PROFILE}" >/dev/null 2>&1 \
  || die "Failed to validate AWS credentials for profile: ${AWS_PROFILE}"

echo "Resolving AWS Account ID from the specified profile..."
AWS_ACCOUNT_ID="$(
  aws sts get-caller-identity \
    --profile "${AWS_PROFILE}" \
    --query 'Account' \
    --output text
)"
[[ -n "${AWS_ACCOUNT_ID}" && "${AWS_ACCOUNT_ID}" != "None" ]] || die "Failed to resolve AWS Account ID."

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Searching ECR repositories for key: frontend ..."
mapfile -t CANDIDATES < <(
  aws ecr describe-repositories \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}" \
    --query 'repositories[].repositoryName' \
    --output text \
  | tr '\t' '\n' \
  | grep -F "frontend" || true
)

if [[ ${#CANDIDATES[@]} -eq 0 ]]; then
  die "No ECR repository found containing: frontend"
fi

REPO=""
for r in "${CANDIDATES[@]}"; do
  if [[ "${r}" == "frontend" ]]; then
    REPO="frontend"
    break
  fi
done

if [[ -z "${REPO}" ]]; then
  if [[ ${#CANDIDATES[@]} -eq 1 ]]; then
    REPO="${CANDIDATES[0]}"
  else
    echo "Multiple repositories matched 'frontend'. Refusing to choose automatically:" >&2
    printf ' - %s\n' "${CANDIDATES[@]}" >&2
    die "Please rename repositories to make the match unique (or adjust the selection rule)."
  fi
fi

IMAGE_URI="${ECR_REGISTRY}/${REPO}:${IMAGE_TAG}"

echo "Resolved settings:"
echo "  Profile:       ${AWS_PROFILE}"
echo "  Region:        ${AWS_REGION}"
echo "  Account:       ${AWS_ACCOUNT_ID}"
echo "  Repo:          ${REPO}"
echo "  Image:         ${IMAGE_URI}"
echo "  Platform:      ${DOCKER_PLATFORM}"
echo "  Asset Prefix:  ${ASSET_PREFIX:-<not set>}"
echo "  App Dir:       ${CONTAINER_APP_DIR}"
echo "  Bucket Key:    ${BUCKET_KEY}"
echo "  CF Comment:    ${CF_COMMENT}"

echo "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" --profile "${AWS_PROFILE}" \
  | docker login --username AWS --password-stdin "${ECR_REGISTRY}" >/dev/null
echo "ECR login succeeded."

echo "Building Docker image..."
BUILD_ARGS=()
if [[ -n "${ASSET_PREFIX}" ]]; then
  BUILD_ARGS+=(--build-arg "NEXT_PUBLIC_ASSET_PREFIX=${ASSET_PREFIX}")
fi

docker build \
  --platform "${DOCKER_PLATFORM}" \
  "${BUILD_ARGS[@]}" \
  -t "${IMAGE_URI}" \
  .

echo "Docker build succeeded."

echo "Pushing Docker image to ECR..."
docker push "${IMAGE_URI}"
echo "Docker push succeeded."

if [[ "${SKIP_ASSETS}" == "true" ]]; then
  echo "Skipping assets extraction and S3 sync."
  echo "All done!"
  exit 0
fi

TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "${TMP_DIR}" >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "Creating a temporary container to extract assets..."
CID="$(docker create "${IMAGE_URI}")"
trap 'docker rm -f "${CID}" >/dev/null 2>&1 || true; cleanup' EXIT

NEXT_STATIC_SRC_IN_CONTAINER="${CONTAINER_APP_DIR}/.next/static"
PUBLIC_SRC_IN_CONTAINER="${CONTAINER_APP_DIR}/public"

echo "Extracting .next/static from the image..."
if ! docker cp "${CID}:${NEXT_STATIC_SRC_IN_CONTAINER}" "${TMP_DIR}/static" >/dev/null 2>&1; then
  die "Failed to extract ${NEXT_STATIC_SRC_IN_CONTAINER}. Ensure the final image contains .next/static."
fi

echo "Extracting public from the image (optional)..."
if docker cp "${CID}:${PUBLIC_SRC_IN_CONTAINER}" "${TMP_DIR}/public" >/dev/null 2>&1; then
  :
else
  echo "WARNING: public directory not found in the image. Skipping public sync."
fi

echo "Removing the temporary container..."
docker rm -f "${CID}" >/dev/null
CID=""

echo "Resolving S3 bucket name by keyword: ${BUCKET_KEY} ..."
mapfile -t BUCKETS < <(
  aws s3api list-buckets \
    --profile "${AWS_PROFILE}" \
    --query 'Buckets[].Name' \
    --output text \
  | tr '\t' '\n' \
  | grep -F "${BUCKET_KEY}" || true
)

if [[ ${#BUCKETS[@]} -eq 0 ]]; then
  die "No S3 bucket found containing keyword: ${BUCKET_KEY}"
elif [[ ${#BUCKETS[@]} -gt 1 ]]; then
  echo "Multiple S3 buckets matched '${BUCKET_KEY}'. Refusing to choose automatically:" >&2
  printf ' - %s\n' "${BUCKETS[@]}" >&2
  die "Please make the match unique (or pass a more specific --bucket-key)."
fi

BUCKET_NAME="${BUCKETS[0]}"
echo "Resolved S3 bucket: ${BUCKET_NAME}"

echo "Uploading _next/static/**/* to S3 (immutable cache)..."
aws s3 sync \
  "${TMP_DIR}/static" \
  "s3://${BUCKET_NAME}/_next/static" \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE \
  --delete

if [[ -d "${TMP_DIR}/public" ]]; then
  echo "Uploading public/**/* to S3 (short cache)..."
  aws s3 sync \
    "${TMP_DIR}/public" \
    "s3://${BUCKET_NAME}/" \
    --profile "${AWS_PROFILE}" \
    --region "${AWS_REGION}" \
    --cache-control "public, max-age=86400" \
    --metadata-directive REPLACE \
    --exclude "_next/*"
else
  echo "Skipping public sync (directory not present)."
fi

if [[ "${SKIP_INVALIDATION}" == "true" ]]; then
  echo "Skipping CloudFront invalidation."
  echo "All done!"
  exit 0
fi

echo "Resolving CloudFront distribution by comment: ${CF_COMMENT} ..."
DISTRIBUTION_ID="$(
  aws cloudfront list-distributions \
    --profile "${AWS_PROFILE}" \
    --query "DistributionList.Items[?Comment=='${CF_COMMENT}'].Id | [0]" \
    --output text
)"

if [[ "${DISTRIBUTION_ID}" != "None" && -n "${DISTRIBUTION_ID}" ]]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*" \
    --profile "${AWS_PROFILE}" >/dev/null
  echo "CloudFront invalidation started."
else
  echo "WARNING: CloudFront distribution not found. Skipping invalidation."
fi

echo "All done!"
