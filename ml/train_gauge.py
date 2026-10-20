import lightgbm as lgb
from features import load, prepare

train, test = load()

X_train, y_train = prepare(train, train), train["gauge"].astype(int)
X_test, y_test = prepare(test, train), test["gauge"].astype(int)

model = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                           reg_lambda=1.0, verbose=-1)
model.fit(X_train, y_train)

accuracy = (model.predict(X_test) == y_test).mean()

print("              Baseline   Before   Now      Target")
print(f"Gauge exact:    88.8%     95.7%    {accuracy:.1%}    97%")