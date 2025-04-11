export default {
  preset: 'ts-jest', // use ts-jest for TypeScript
  testEnvironment: 'node', // Configure test env to Node.js
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Map imports from ES6 to Jest
  },
};