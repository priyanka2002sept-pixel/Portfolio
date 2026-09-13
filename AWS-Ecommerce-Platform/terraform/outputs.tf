output "products_table_name" { value = aws_dynamodb_table.products.name }
output "orders_table_name"   { value = aws_dynamodb_table.orders.name }
output "user_pool_id"        { value = aws_cognito_user_pool.main.id }
output "user_pool_client_id" { value = aws_cognito_user_pool_client.main.id }
output "cloudfront_url"      { value = "https://${aws_cloudfront_distribution.frontend.domain_name}" }
