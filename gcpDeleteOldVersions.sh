#!/bin/bash

# Usage: ./delete_old_versions.sh SERVICE_NAME
# Example: ./delete_old_versions.sh frontend

SERVICE_NAME=$1

if [ -z "$SERVICE_NAME" ]; then
  echo "Error: Please provide a service name."
  echo "Usage: $0 SERVICE_NAME"
  exit 1
fi

# Get yesterday's date in YYYYMMDD format
YESTERDAY=$(date -d "yesterday" +%Y%m%d)

echo "Deleting versions of service '$SERVICE_NAME' older than $YESTERDAY ..."

# List all versions of the service
gcloud app versions list --service="$SERVICE_NAME" --format="csv[no-heading](version.id,version.createTime)" | while IFS=, read -r VERSION CREATE_TIME
do
  # Extract date part YYYYMMDD from CREATE_TIME
  VERSION_DATE=$(echo "$CREATE_TIME" | cut -d'T' -f1 | tr -d '-')

  if [ "$VERSION_DATE" -lt "$YESTERDAY" ]; then
    echo "Deleting version: $VERSION (created on $CREATE_TIME)"
    gcloud app versions delete "$VERSION" --service="$SERVICE_NAME" --quiet
  fi
done

echo "Cleanup completed."
