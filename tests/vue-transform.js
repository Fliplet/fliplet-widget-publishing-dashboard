// Simple Vue file transformer for Jest
module.exports = {
  process() {
    return {
      code: `
        module.exports = {
          render: () => {},
          staticRenderFns: [],
          _compiled: true
        };
      `
    };
  }
};