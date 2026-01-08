import Logo from "./Logo";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-4">
      <div className="animate-pulse">
        <Logo size="xl" iconOnly />
      </div>
      <div className="animate-fade-in">
        <Logo size="lg" variant="auto" />
      </div>
    </div>
  );
};

export default LoadingScreen;
