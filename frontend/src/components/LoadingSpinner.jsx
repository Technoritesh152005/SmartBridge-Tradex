function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      <p className="text-muted mt-3 mb-0">{text}</p>
    </div>
  );
}

export default LoadingSpinner;
