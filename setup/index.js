const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-northeast-1',
  // @ts-ignore
  endpoint: 'http://localhost:8000',
});

const dynamodb = new AWS.DynamoDB();

const createTable = (params) =>
  new Promise((resolve, reject) => {
    dynamodb.createTable(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });

const put = (params) =>
  new Promise((resolve, reject) => {
    dynamodb.putItem(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });

(async () => {
  await createTable({
    TableName: 'user',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'user',
    Item: {
      id: { S: 'user_primary_key' },
      name: { S: 'bokuweb' },
      num_usize: { N: '42' },
      num_u8: { N: '255' },
      num_i8: { N: '-127' },
      option_i16: { N: '-1' },
      string_set: { SS: ['Hello'] },
      number_set: { NS: ['1'] },
    },
  });

  await createTable({
    TableName: 'FloatTest',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'FloatTest',
    Item: {
      id: { S: 'primary_key' },
      float32: { N: '1.23' },
      float64: { N: '2.34' },
    },
  });

  await createTable({
    TableName: 'QueryTestData0',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'year', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'year', AttributeType: 'N' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'QueryTestData0',
    Item: { id: { S: 'id0' }, name: { S: 'john' }, year: { N: '1999' }, num: { N: '1000' } },
  });
  await put({
    TableName: 'QueryTestData0',
    Item: { id: { S: 'id0' }, name: { S: 'john' }, year: { N: '2000' }, num: { N: '2000' } },
  });
  await put({
    TableName: 'QueryTestData0',
    Item: { id: { S: 'id1' }, name: { S: 'bob' }, year: { N: '2003' }, num: { N: '300' } },
  });
  await put({
    TableName: 'QueryTestData0',
    Item: { id: { S: 'id2' }, name: { S: 'alice' }, year: { N: '2013' }, num: { N: '4000' } },
  });

  await put({
    TableName: 'QueryTestData0',
    Item: { id: { S: 'id3' }, name: { S: 'bar0' }, year: { N: '1987' }, num: { N: '4000' } },
  });

  await put({
    TableName: 'QueryTestData0',
    Item: { id: { S: 'id3' }, name: { S: 'bar1' }, year: { N: '2000' }, num: { N: '4000' } },
  });

  await put({
    TableName: 'QueryTestData0',
    Item: { id: { S: 'id3' }, name: { S: 'bar2' }, year: { N: '2029' }, num: { N: '4000' } },
  });

  await createTable({
    TableName: 'QueryTestData1',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'name', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'name', AttributeType: 'S' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'QueryTestData1',
    Item: { id: { S: 'id0' }, name: { S: 'john' } },
  });
  await put({
    TableName: 'QueryTestData1',
    Item: { id: { S: 'id0' }, name: { S: 'jack' } },
  });
  await put({
    TableName: 'QueryTestData1',
    Item: { id: { S: 'id0' }, name: { S: 'bob' } },
  });

  await createTable({
    TableName: 'RenameTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });
  await put({
    TableName: 'RenameTestData0',
    Item: { id: { S: 'id0' }, name: { S: 'john' }, renamed: { N: '1999' } },
  });
  await put({
    TableName: 'RenameTestData0',
    Item: { id: { S: 'id1' }, name: { S: 'bob' }, renamed: { N: '2003' } },
  });

  await createTable({
    TableName: 'RenameAllCamelCaseTestData0',
    KeySchema: [{ AttributeName: 'partitionKey', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'partitionKey', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });
  await put({
    TableName: 'RenameAllCamelCaseTestData0',
    Item: { partitionKey: { S: 'id0' }, fooBar: { S: 'john' }, projectId: { N: '1' } },
  });
  await put({
    TableName: 'RenameAllCamelCaseTestData0',
    Item: { partitionKey: { S: 'id1' }, fooBar: { S: 'bob' }, projectId: { N: '2' } },
  });

  await createTable({
    TableName: 'RenameAllPascalCaseTestData0',
    KeySchema: [{ AttributeName: 'PartitionKey', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'PartitionKey', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });
  await put({
    TableName: 'RenameAllPascalCaseTestData0',
    Item: { PartitionKey: { S: 'id0' }, FooBar: { S: 'john' }, ProjectId: { N: '1' } },
  });
  await put({
    TableName: 'RenameAllPascalCaseTestData0',
    Item: { PartitionKey: { S: 'id1' }, FooBar: { S: 'bob' }, ProjectId: { N: '2' } },
  });

  await createTable({
    TableName: 'UpdateTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });
  await put({
    TableName: 'UpdateTestData0',
    Item: { id: { S: 'id0' }, name: { S: 'john' }, age: { N: '12' }, num: { N: '1' } },
  });
  await put({
    TableName: 'UpdateTestData0',
    Item: { id: { S: 'id1' }, name: { S: 'bob' }, age: { N: '18' }, num: { N: '1' } },
  });

  await createTable({
    TableName: 'UpdateTestData1',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'age', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'age', AttributeType: 'N' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });
  await put({
    TableName: 'UpdateTestData1',
    Item: { id: { S: 'id0' }, name: { S: 'john' }, age: { N: '36' } },
  });

  await createTable({
    TableName: 'PutItemConditionData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'user',
    Item: {
      id: { S: 'id0' },
      name: { S: 'bokuweb' },
      num: { N: '1000' },
    },
  });

  await createTable({
    TableName: 'LastEvaluateKeyData',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'ref_id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'testGSI',
        KeySchema: [{ AttributeName: 'ref_id', KeyType: 'HASH' }],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
  });

  for (let i = 0; i < 10; i++) {
    await put({
      TableName: 'LastEvaluateKeyData',
      Item: {
        id: { S: `id${i}` },
        ref_id: { S: `id0` },
        long_text: { S: new Array(100000).fill('Test').join('') },
      },
    });
  }

  await createTable({
    TableName: 'Project',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'orgId', AttributeType: 'S' },
      { AttributeName: 'updatedAt', AttributeType: 'S' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'orgIndex',
        KeySchema: [
          {
            AttributeName: 'orgId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'updatedAt',
            KeyType: 'RANGE',
          },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
  });

  for (let i = 0; i < 10; i++) {
    await put({
      TableName: 'Project',
      Item: {
        id: { S: `id${i}` },
        orgId: { S: `myOrg` },
        updatedAt: { S: '2019-03-11T00:00+0900' },
      },
    });
  }

  await createTable({
    TableName: 'BatchTest0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  for (let i = 0; i < 101; i++) {
    await put({
      TableName: 'BatchTest0',
      Item: { id: { S: `id${i}` }, name: { S: 'bob' } },
    });
  }

  await createTable({
    TableName: 'BatchTest1',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'year', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'year', AttributeType: 'N' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 50, WriteCapacityUnits: 50 },
  });

  for (let i = 0; i < 250; i++) {
    await put({
      TableName: 'BatchTest1',
      Item: { id: { S: `id${i}` }, name: { S: 'bob' }, year: { N: `${2000 + i}` }, num: { N: `${i}` } },
    });
  }

  await createTable({
    TableName: 'BatchTest2',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 50, WriteCapacityUnits: 50 },
  });

  for (let i = 0; i < 250; i++) {
    await put({
      TableName: 'BatchTest2',
      Item: { id: { S: `id${i}` }, name: { S: [...new Array(100000)].map((_) => 'test').join('') } },
    });
  }

  await createTable({
    TableName: 'test-user-staging',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'orgId', AttributeType: 'S' },
      { AttributeName: 'updatedAt', AttributeType: 'S' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'orgIndex',
        KeySchema: [
          {
            AttributeName: 'orgId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'updatedAt',
            KeyType: 'RANGE',
          },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
  });

  await createTable({
    TableName: 'DeleteTest0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'DeleteTest0',
    Item: {
      id: { S: 'id0' },
      name: { S: 'bokuweb' },
      number_set: { NS: ['1'] },
    },
  });

  await put({
    TableName: 'DeleteTest0',
    Item: {
      id: { S: 'id1' },
      name: { S: 'bokuweb' },
      removable: { BOOL: true },
    },
  });

  await createTable({
    TableName: 'DeleteTest1',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'year', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'year', AttributeType: 'N' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'DeleteTest1',
    Item: {
      id: { S: 'id0' },
      name: { S: 'alice' },
      year: { N: '1999' },
    },
  });

  await createTable({
    TableName: 'ScanTestData0',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'year', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'year', AttributeType: 'N' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'ScanTestData0',
    Item: {
      id: { S: 'scanId0' },
      name: { S: 'scanAlice' },
      year: { N: '2001' },
      num: { N: '2000' },
    },
  });

  await createTable({
    TableName: 'EmptySetTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'EmptySetTestData0',
    Item: {
      id: { S: 'id0' },
      nset: { NS: ['2000'] },
      sset: { SS: ['Hello'] },
    },
  });

  await put({
    TableName: 'EmptySetTestData0',
    Item: {
      id: { S: 'id1' },
      nset: { NS: ['2001'] },
      sset: { SS: ['World'] },
    },
  });

  await createTable({
    TableName: 'EmptyStringTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'EmptyStringTestData0',
    Item: {
      id: { S: 'id0' },
      name: { NULL: true },
    },
  });

  await createTable({
    TableName: 'UpdateDeleteTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'UpdateDeleteTestData0',
    Item: {
      id: { S: 'id0' },
      sset: { SS: ['foo', 'bar'] },
    },
  });

  await createTable({
    TableName: 'UpdateAddTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'UpdateAddTestData0',
    Item: {
      id: { S: 'id0' },
      sset: { SS: ['foo', 'bar'] },
    },
  });

  await put({
    TableName: 'UpdateAddTestData0',
    Item: {
      id: { S: 'id1' },
      sset: { NULL: true },
    },
  });

  await put({
    TableName: 'UpdateAddTestData0',
    Item: {
      id: { S: 'id2' },
    },
  });

  await createTable({
    TableName: 'EmptyPutTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await createTable({
    TableName: 'ReservedTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'ReservedTestData0',
    Item: { id: { S: 'id0' }, type: { S: 'reserved' } },
  });

  await createTable({
    TableName: 'UseDefaultTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'UseDefaultTestData0',
    Item: { id: { S: 'id0' } },
  });

  await createTable({
    TableName: 'TxDeleteTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'TxDeleteTestData0',
    Item: { id: { S: 'id0' }, name: { S: 'hello' } },
  });

  await createTable({
    TableName: 'TxConditionalCheckTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'TxConditionalCheckTestData0',
    Item: { id: { S: 'id0' }, name: { S: 'hello' } },
  });

  await createTable({
    TableName: 'TxConditionalCheckTestData1',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'TxConditionalCheckTestData1',
    Item: { id: { S: 'id1' }, name: { S: 'world' } },
  });

  await createTable({
    TableName: 'UpdateRemoveTestData0',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'UpdateRemoveTestData0',
    Item: { id: { S: 'id1' }, name: { S: 'world' } },
  });

  await put({
    TableName: 'UpdateRemoveTestData0',
    Item: { id: { S: 'id2' } },
  });

  await createTable({
    TableName: 'UpdateWithContainsInSetCondition',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await put({
    TableName: 'UpdateWithContainsInSetCondition',
    Item: {
      id: { S: 'id0' },
      name: { S: 'bokuweb' },
      sset: { SS: ['Hello'] },
    },
  });

  await createTable({
    TableName: 'QueryLargeDataTest',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'ref_id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 50, WriteCapacityUnits: 50 },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'testGSI',
        KeySchema: [{ AttributeName: 'ref_id', KeyType: 'HASH' }],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
  });

  for (let i = 0; i < 100; i++) {
    await put({
      TableName: 'QueryLargeDataTest',
      Item: {
        id: { S: `id${i}` },
        ref_id: { S: 'ref' },
        name: { S: [...new Array(100000)].map((_) => 'test').join('') }, // 400KB
      },
    });
  }

  await createTable({
    TableName: 'ScanLargeDataTest',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 50, WriteCapacityUnits: 50 },
  });

  for (let i = 0; i < 100; i++) {
    await put({
      TableName: 'ScanLargeDataTest',
      Item: {
        id: { S: `id${i}` },
        ref_id: { S: 'ref' },
        name: { S: [...new Array(100000)].map((_) => 'test').join('') }, // 400KB
      },
    });
  }
})();
