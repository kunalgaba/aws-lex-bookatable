rm index.zip 
cd lambda 
zip ../index.zip *
cd .. 
aws lambda update-function-code --function-name validateTableBookingRequest  --zip-file fileb://index.zip

