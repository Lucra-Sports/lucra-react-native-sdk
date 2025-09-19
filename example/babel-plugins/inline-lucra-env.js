const lucraEnvKeys = ['LUCRA_SDK_API_URL', 'LUCRA_SDK_API_KEY'];

module.exports = function inlineLucraEnv({ types: t }) {
  return {
    name: 'inline-lucra-env',
    visitor: {
      MemberExpression(path, state) {
        const values = state.opts?.values ?? {};

        if (
          !t.isMemberExpression(path.node.object) ||
          !t.isIdentifier(path.node.object.object, { name: 'process' }) ||
          !t.isIdentifier(path.node.object.property, { name: 'env' }) ||
          !t.isIdentifier(path.node.property)
        ) {
          return;
        }

        const key = path.node.property.name;
        if (!lucraEnvKeys.includes(key)) {
          return;
        }

        const value = Object.prototype.hasOwnProperty.call(values, key)
          ? values[key]
          : '';

        path.replaceWith(t.stringLiteral(value ?? ''));
      },
    },
  };
};
