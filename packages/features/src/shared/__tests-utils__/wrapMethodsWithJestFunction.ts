/**
 * Создает spies для всех методов экземпляра класса с помощью jest.spyOn.
 * Это позволяет использовать методы в expect().toHaveBeenCalled() без явного оборачивания.
 *
 * Работает как с обычными методами прототипа, так и со стрелочными функциями (arrow functions),
 * которые хранятся как свойства экземпляра.
 *
 * @param instance - Экземпляр класса, методы которого нужно обернуть в spies
 * @returns Тот же экземпляр с обернутыми методами
 */
export function wrapMethodsWithJestFunction<T extends object>(instance: T): T {
  // Используем any для внутренней работы с динамическими свойствами
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const wrappedInstance = instance as any;

  // Обрабатываем свойства экземпляра (arrow functions и другие свойства)
  const instancePropertyNames = Object.getOwnPropertyNames(instance);

  instancePropertyNames.forEach((name) => {
    // Пропускаем приватные свойства (начинающиеся с _)
    if (name.startsWith('_')) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const value = wrappedInstance[name];

    // Создаем spy только для функций
    if (typeof value === 'function') {
      jest.spyOn(wrappedInstance, name as string);
    }
  });

  // Обрабатываем методы прототипа (обычные методы класса)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const prototype: object = Object.getPrototypeOf(instance);
  const prototypePropertyNames = Object.getOwnPropertyNames(prototype);

  prototypePropertyNames.forEach((name) => {
    // Пропускаем конструктор и приватные методы
    if (name === 'constructor' || name.startsWith('_')) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(prototype, name);

    // Пропускаем геттеры, сеттеры и не-функции
    if (!descriptor || typeof descriptor.value !== 'function') {
      return;
    }

    // Пропускаем, если метод уже обернут (проверяем экземпляр)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (wrappedInstance[name] !== undefined) {
      return;
    }

    // Создаем spy для метода прототипа
    jest.spyOn(wrappedInstance, name as string);
  });

  return wrappedInstance as T;
}
