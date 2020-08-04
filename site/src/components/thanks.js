import { Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const Thanks = ({ handle }) => {

  const [message, setMessage] = useState({});
  useEffect(() => {
    fetch(`/api/thanks?handle=${handle}`, {
      method: 'get',
      headers: { accept: 'application/json' }
    })
      .then(result => result.json())
      .then(message => setMessage(message));
  }, []);

  return (
    <section style={{ textAlign: 'center' }}>
      <h2>{message.header}</h2>
      <p>{message.content}</p>
    </section>
  );
};

export default Thanks;