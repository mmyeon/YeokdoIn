const PersonalRecord = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">개인 기록</h1>
      <p className="text-muted-foreground">
        개인 기록을 바탕으로 훈련 중량을 계산해 드릴게요.
      </p>

      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="clean-and-jerk-pr" className="toss-label">
            클린 앤 저크 개인 기록 (kg)
          </label>
          <input
            id="clean-and-jerk-pr"
            type="number"
            placeholder="무게를 kg 단위로 입력하세요."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="snatch-pr" className="toss-label">
            스내치 개인 기록 (kg)
          </label>
          <input
            id="snatch-pr"
            type="number"
            placeholder="무게를 kg 단위로 입력하세요."
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalRecord;
