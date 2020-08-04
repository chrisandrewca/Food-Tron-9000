import cx from 'classnames';

const FieldError = (props) => {
	const {
		err,
		...spanProps
	} = props;

	spanProps.class = cx(
		'input-error-text',
		spanProps.class);

	return (
		!!err &&
		<span
			role='alert'
			{...spanProps}
		>
			{err}
		</span>
	);
};

export default FieldError;