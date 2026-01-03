// Test file to verify employee ID generation logic
import { generateUniqueEmployeeId } from './lib/utils';

async function testEmployeeIdGeneration() {
  try {
    const employeeId1 = await generateUniqueEmployeeId();
    const employeeId2 = await generateUniqueEmployeeId();
    const employeeId3 = await generateUniqueEmployeeId();
    
    console.log('Generated Employee IDs:');
    console.log('1:', employeeId1);
    console.log('2:', employeeId2);
    console.log('3:', employeeId3);
    
    // Verify format: EMP-YYYY-NNNN
    const format = /^EMP-\d{4}-\d{4}$/;
    const isValidFormat = format.test(employeeId1) && format.test(employeeId2) && format.test(employeeId3);
    
    console.log('Format validation:', isValidFormat ? '✅ PASS' : '❌ FAIL');
    
    // Verify uniqueness
    const areUnique = employeeId1 !== employeeId2 && employeeId2 !== employeeId3 && employeeId1 !== employeeId3;
    console.log('Uniqueness check:', areUnique ? '✅ PASS' : '❌ FAIL');
    
    // Verify increment
    const parts1 = employeeId1.split('-');
    const parts2 = employeeId2.split('-');
    const parts3 = employeeId3.split('-');
    
    const serial1 = parseInt(parts1[2]);
    const serial2 = parseInt(parts2[2]);
    const serial3 = parseInt(parts3[2]);
    
    const isIncrementing = serial2 > serial1 && serial3 > serial2;
    console.log('Increment check:', isIncrementing ? '✅ PASS' : '❌ FAIL');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Uncomment to test
// testEmployeeIdGeneration();
