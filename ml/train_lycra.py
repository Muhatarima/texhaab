import lightgbm as lgb
from features import load, prepare, FEATURES

train, test = load()

# Only fabrics that have lycra AND a recorded denier
train = train[train["lycra"] & train["lycra_denier"].notna()]
test = test[test["lycra"] & test["lycra_denier"].notna()]

# Same inputs, minus "lycra" (it's True for every row here)
LYCRA_FEATURES = [f for f in FEATURES if f != "lycra"]

X_train, y_train = prepare(train, train, LYCRA_FEATURES), train["lycra_denier"].astype(int)
X_test, y_test = prepare(test, train, LYCRA_FEATURES), test["lycra_denier"].astype(int)

model = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                           reg_lambda=1.0, verbose=-1)
model.fit(X_train, y_train)

exact = (model.predict(X_test) == y_test).mean()

print("                    Baseline   Before   Now      Target")
print(f"Lycra denier exact:  33.4%     87.2%    {exact:.1%}    90%")