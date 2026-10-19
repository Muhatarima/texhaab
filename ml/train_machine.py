import numpy as np
import lightgbm as lgb
from features import load, prepare

train, test = load()

X_train, y_train = prepare(train, train), train["mc_dia"].astype(int)
X_test, y_test = prepare(test, train), test["mc_dia"].astype(int)

model = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                           reg_lambda=1.0, verbose=-1)
model.fit(X_train, y_train)

# Single best guess
exact = (model.predict(X_test) == y_test).mean()

# Top 2 guesses
proba = model.predict_proba(X_test)
top2 = model.classes_[np.argsort(proba, axis=1)[:, -2:]]
in_top2 = np.array([actual in guesses for actual, guesses in zip(y_test, top2)]).mean()

print("                  Before   Now      Target")
print(f"Machine dia exact:  68.9%    {exact:.1%}")
print(f"Actual in top 2:    85.6%    {in_top2:.1%}    90%")