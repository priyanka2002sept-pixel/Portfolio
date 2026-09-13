import json, pytest, boto3, os, uuid
from moto import mock_aws
from boto3.dynamodb.conditions import Key

os.environ["PRODUCTS_TABLE"]         = "test-products"
os.environ["ORDERS_TABLE"]           = "test-orders"
os.environ["ENVIRONMENT"]            = "test"
os.environ["AWS_DEFAULT_REGION"]     = "us-east-1"
os.environ["AWS_ACCESS_KEY_ID"]      = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"]  = "testing"


@pytest.fixture
def products_table():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName="test-products",
            KeySchema=[{"AttributeName": "productId", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "productId", "AttributeType": "S"},
                {"AttributeName": "category",  "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[{
                "IndexName": "category-index",
                "KeySchema": [{"AttributeName": "category", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {"ReadCapacityUnits": 1, "WriteCapacityUnits": 1}
            }],
            BillingMode="PAY_PER_REQUEST"
        )
        table.wait_until_exists()
        yield table


class TestProducts:
    @mock_aws
    def test_get_products_returns_items(self, products_table):
        products_table.put_item(Item={"productId": "1", "name": "Test", "category": "Books", "price": "10"})
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table    = dynamodb.Table("test-products")
        result   = table.scan()
        assert result["Count"] == 1
        assert result["Items"][0]["name"] == "Test"

    @mock_aws
    def test_product_saved_with_correct_fields(self, products_table):
        product = {
            "productId":   str(uuid.uuid4()),
            "name":        "Laptop",
            "price":       "999.99",
            "category":    "Electronics",
            "description": "A great laptop",
            "stock":       10
        }
        products_table.put_item(Item=product)
        result = products_table.get_item(Key={"productId": product["productId"]})
        assert result["Item"]["name"]     == "Laptop"
        assert result["Item"]["price"]    == "999.99"
        assert result["Item"]["category"] == "Electronics"

    @mock_aws
    def test_category_filter_returns_correct_items(self, products_table):
        products_table.put_item(Item={"productId": "a", "name": "Laptop",  "category": "Electronics", "price": "999"})
        products_table.put_item(Item={"productId": "b", "name": "T-Shirt", "category": "Clothing",    "price": "25"})
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table    = dynamodb.Table("test-products")
        result   = table.query(
            IndexName="category-index",
            KeyConditionExpression=Key("category").eq("Electronics")
        )
        assert result["Count"] == 1
        assert result["Items"][0]["name"] == "Laptop"
