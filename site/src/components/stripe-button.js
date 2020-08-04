import { h } from 'preact';

const StripeButton = ({ promotion, userId }) => {

  const handleAuthStripe = async (e) => {
    let url;
    if (!userId) {
      const result = await fetch('/api/authorize-stripe/url', {
        method: 'get',
        headers: { accept: 'application/json' },
        credentials: 'same-origin'
      });
      url = await result.json();
    } else {
      url = '/start';
    }
    window.location.href = url;
  };

  const text = promotion
    ? 'Start'
    : 'Begin collecting payment';

  const className = promotion
    ? 'button-inverse button-small'
    : 'button';

  return (
    <button className={className} onClick={handleAuthStripe}>
      {text}
    </button>
  );
}

export default StripeButton;