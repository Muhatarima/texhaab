import lightgbm as lgb
from features import load, prepare

train, test = load()

X_train, y_train = prepare(train, train), train["yarn_count"].astype(int)
X_test, y_test = prepare(test, train), test["yarn_count"].astype(int)

model = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                           reg_lambda=1.0, verbose=-1)
model.fit(X_train, y_train)

predicted = model.predict(X_test)
exact = (predicted == y_test).mean()
within_2 = (abs(predicted - y_test) <= 2).mean()

print("                  Baseline   Before   Now      Target")
print(f"Yarn count exact:   36.5%     75.9%    {exact:.1%}    85%")
print(f"Within 2:           49.3%     89.8%    {within_2:.1%}    95%")