#!/bin/sh
# Runs the Serverless Framework with fresh AWS credentials: `scripts/serverless.sh deploy --stage dev`.
#
# Serverless reads an IAM Identity Center profile's cached access token but can't renew it, so it
# fails about an hour after `aws sso login` even though the session is still valid. The AWS CLI
# renews the token, so it hands this process short-lived role credentials (in the environment,
# never on disk) and Serverless uses those instead of the profile.
set -eu
# The Hurricast account, unless a profile is already chosen (direnv sets the same one).
profile=${AWS_PROFILE:-tgh-ryan}
if ! creds=$(aws configure export-credentials --profile "$profile" --format env); then
	echo "Sign in first: aws sso login --sso-session ryantoken" >&2
	exit 1
fi
eval "$creds"
unset AWS_PROFILE creds
exec serverless "$@"
