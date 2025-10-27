import { createOne, findOne, updateOne, createMany, findMany, updateMany, deleteOne, deleteMany } from './mongo/crud.js';
import "dotenv/config.js";
async function testCRUD() {
  try {
    // Test createOne
    const insertResult = await createOne('testCollection', { name: 'Test Doc', value: 1 });
    console.log('createOne result:', insertResult);

    // Test findOne
    const findResult = await findOne('testCollection', { name: 'Test Doc' });
    console.log('findOne result:', findResult);

    // Test updateOne
    const updateResult = await updateOne('testCollection', { name: 'Test Doc' }, { $set: { value: 2 } });
    console.log('updateOne result:', updateResult);

    // Test createMany
    const insertManyResult = await createMany('testCollection', [
      { name: 'Doc1', value: 10 },
      { name: 'Doc2', value: 20 }
    ]);
    console.log('createMany result:', insertManyResult);

    // Test findMany
    const findManyResult = await findMany('testCollection', {}, { name: 1, value: 1 });
    console.log('findMany result:', findManyResult);

    // Test updateMany
    const updateManyResult = await updateMany('testCollection', { value: { $lt: 15 } }, { $set: { status: 'updated' } });
    console.log('updateMany result:', updateManyResult);

    // Test deleteOne
    const deleteOneResult = await deleteOne('testCollection', { name: 'Test Doc' });
    console.log('deleteOne result:', deleteOneResult);

    // Test deleteMany
    const deleteManyResult = await deleteMany('testCollection', { value: { $gte: 10 } });
    console.log('deleteMany result:', deleteManyResult);

  } catch (error) {
    console.error('Test error:', error);
  }

process.exit(0);
}

testCRUD();