import lightgbm as lgb
from features import load, prepare, FEATURES

train, test = load()


def train_classifier(target):
    """Train a model that picks one value for `target`."""
    model = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                               reg_lambda=1.0, verbose=-1)
    model.fit(prepare(train, train), train[target].astype(int))
    return model


# Step 1 of the chain: predict gauge and yarn count for the test orders
gauge_model = train_classifier("gauge")
yarn_model = train_classifier("yarn_count")

test_chain = test.copy()
test_chain["gauge"] = gauge_model.predict(prepare(test, train))
test_chain["yarn_count"] = yarn_model.predict(prepare(test, train))

# Step 2: stitch length model, which also sees gauge and yarn count
SL_FEATURES = FEATURES + ["gauge", "yarn_count"]

X_train = prepare(train, train, SL_FEATURES)        # real gauge and count
X_test = prepare(test_chain, train, SL_FEATURES)    # predicted gauge and count
y_train, y_test = train["stitch_length"], test["stitch_length"]

model = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05,
                          reg_lambda=1.0, verbose=-1)
model.fit(X_train, y_train)

predicted = model.predict(X_test)
within_1 = (abs(predicted - y_test) <= 1).mean()
typical_error = abs(predicted - y_test).median()

print("                         Baseline   Before   Now      Target")
print(f"Stitch length within 1:   62.5%     79.1%    {within_1:.1%}    93%")
print(f"Typical error (median):             0.46     {typical_error:.2f}")