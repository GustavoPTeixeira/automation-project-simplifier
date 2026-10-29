function generateDataFactory(language) {
    const isTS = language === 'typescript';

    if (isTS) {
        return `import { faker } from '@faker-js/faker';

export interface UserData {
  id?: string;
  username: string;
  email: string;
  password?: string;
  fullName?: string;
}

export function createFakeUser(overrides: Partial<UserData> = {}): UserData {
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    fullName: faker.person.fullName(),
    ...overrides,
  };
}

export function createFakeUsers(count: number = 3): UserData[] {
  return Array.from({ length: count }, () => createFakeUser());
}
`;
    }

    return `const { faker } = require('@faker-js/faker');

function createFakeUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    fullName: faker.person.fullName(),
    ...overrides,
  };
}

function createFakeUsers(count = 3) {
  return Array.from({ length: count }, () => createFakeUser());
}

module.exports = {
  createFakeUser,
  createFakeUsers,
};
`;
}

module.exports = { generateDataFactory };