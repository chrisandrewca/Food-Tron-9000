export const makeAction = (func) => (action, ...args) => {

  let pre = {
    result: {}
  };

  const result = func.apply(null, [action, ...args]);

  if (result.then) {
    return result.then(state => {
      return {
        ...pre,
        ...state,
      };
    });
  } else {
    return {
      ...pre,
      ...result
    };
  }
};