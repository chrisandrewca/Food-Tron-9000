import { connect, select } from 'unistore/preact';
import { useState } from 'preact/hooks';

const actions = (store) => ({
  async clearWarning(state, key) {
    const { handle } = state;
    delete state[key];
    store.setState(state);

    // WARNING: wait prior to state change ultimately causes persist to break
    // does it happen in unistore or unissist?
    // see https://github.com/DonnieWest/unissist/blob/794516871746053708a5b91243063465d64382f5/src/index.js#L51
    await fetch('/api/setting', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        handle: handle,
        setting: {
          [key]: false
        }
      })
    });
  }
});

// TODO https://github.com/developit/unistore/issues/136
const Notice = connect(state => state, actions)((state) => {
  const { clearWarning, setting } = state;
  const [message, setMessage] = useState(state[setting]);

  const hide = async () => {
    setMessage(null);
    await clearWarning(setting);
  };

  return message
    ? <p style={{ lineHeight: '2rem' }}>{message} <a href='#' class='button-inverse button-small' onClick={hide}>Ok</a></p>
    : null;
});

export default Notice;