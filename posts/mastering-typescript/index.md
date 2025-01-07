---
title: 'Mastering TypeScript'
date: '2024-01-06'
excerpt: 'Dive deep into TypeScript and learn how to write better, type-safe code.'
---

# Mastering TypeScript

TypeScript is a powerful superset of JavaScript that adds static typing and other features to help you write more reliable and maintainable code. Let's explore its key features and best practices.

## Why TypeScript?

TypeScript offers several advantages over plain JavaScript:

1. **Static Type Checking**
   - Catch errors at compile time
   - Better IDE support with autocompletion
   - Safer refactoring

2. **Enhanced Code Quality**
   - Self-documenting code
   - Clearer interfaces and contracts
   - Better team collaboration

3. **Modern JavaScript Features**
   - Use latest ECMAScript features
   - Backwards compatibility
   - Automatic polyfilling

## Core Concepts

### Basic Types

TypeScript includes several basic types:

```typescript
// Number
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;

// String
let color: string = "blue";
let greeting: string = `Hello, ${color}`;

// Boolean
let isDone: boolean = false;

// Array
let list: number[] = [1, 2, 3];
let generic: Array<number> = [1, 2, 3];

// Tuple
let tuple: [string, number] = ["hello", 10];
```

### Interfaces

Interfaces define contracts in your code:

```typescript
interface User {
  id: number;
  name: string;
  email?: string;  // Optional property
  readonly createdAt: Date;  // Read-only property
}

function createUser(user: User): User {
  return {
    ...user,
    createdAt: new Date()
  };
}
```

### Type Aliases

Create custom type definitions:

```typescript
type Point = {
  x: number;
  y: number;
};

type ID = string | number;

type Callback = (data: string) => void;
```

### Generics

Write flexible, reusable code:

```typescript
function identity<T>(arg: T): T {
  return arg;
}

// Usage
let output = identity<string>("myString");
let value = identity(123);  // Type inference

// Generic Interface
interface Container<T> {
  value: T;
  getValue(): T;
}
```

## Advanced Features

### Union Types

```typescript
type Status = "pending" | "approved" | "rejected";

function processStatus(status: Status) {
  switch (status) {
    case "pending":
      return "Processing...";
    case "approved":
      return "Success!";
    case "rejected":
      return "Failed";
  }
}
```

### Utility Types

TypeScript provides built-in utility types:

```typescript
// Partial - Make all properties optional
interface Todo {
  title: string;
  description: string;
}

function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate };
}

// Pick - Select specific properties
type TodoPreview = Pick<Todo, "title">;

// Omit - Remove specific properties
type TodoInfo = Omit<Todo, "description">;
```

## Best Practices

1. **Use Strict Mode**
   ```json
   {
     "compilerOptions": {
       "strict": true
     }
   }
   ```

2. **Leverage Type Inference**
   ```typescript
   // Let TypeScript infer types when possible
   const numbers = [1, 2, 3];  // Type: number[]
   const [first, second] = numbers;  // Type: number
   ```

3. **Document with JSDoc**
   ```typescript
   /**
    * Calculates the sum of two numbers
    * @param a First number
    * @param b Second number
    * @returns The sum of a and b
    */
   function add(a: number, b: number): number {
     return a + b;
   }
   ```

## Conclusion

TypeScript is an invaluable tool for modern web development. Its type system and additional features help create more robust and maintainable applications. Start with the basics and gradually incorporate more advanced features as you become comfortable with the language. 