"""
FlagForge AI Module - Synthetic Dataset Generator & Logistic Regression Trainer
Generates realistic rollout telemetry records and trains a lightweight Scikit-Learn
Logistic Regression model for explainable canary release recommendations.
"""

import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(CURRENT_DIR, "rollout_history.csv")
MODEL_PATH = os.path.join(CURRENT_DIR, "model.pkl")

FEATURE_COLUMNS = [
    "error_rate",
    "response_time",
    "api_failures",
    "user_adoption",
    "cpu_usage",
    "memory_usage",
    "rollout_percentage"
]


def generate_rollout_dataset(filepath=CSV_PATH, n_samples=500, random_state=42):
    """
    Generates approximately 500 realistic telemetry records representing software rollouts.
    Applies domain-informed operational rules instead of random labels.
    """
    np.random.seed(random_state)

    # Telemetry distributions with realistic cross-correlations
    err = np.random.exponential(scale=2.2, size=n_samples)
    resp = 100 + (err * 60) + np.random.normal(0, 65, size=n_samples)
    fails = (err * 3.5 + np.random.poisson(lam=2, size=n_samples)).astype(int)
    adopt = np.random.uniform(5.0, 95.0, size=n_samples)
    cpu = 20 + (resp / 12) + np.random.normal(0, 10, size=n_samples)
    mem = 25 + (adopt * 0.4) + np.random.normal(0, 8, size=n_samples)
    roll = np.random.choice([10, 25, 50, 75, 100], size=n_samples).astype(float)

    # Enforce realistic physiological bounds
    err = np.clip(err, 0.05, 12.0)
    resp = np.clip(resp, 50.0, 1100.0)
    fails = np.clip(fails, 0, 90)
    cpu = np.clip(cpu, 15.0, 98.0)
    mem = np.clip(mem, 20.0, 95.0)

    # Multi-factor composite operational risk score
    score = (err * 7.0) + (resp / 30.0) + (fails * 0.6) + (cpu * 0.25) + (mem * 0.15)
    noise = np.random.normal(0, 4.0, size=n_samples)
    total = score + noise

    # Balanced quantile partition with domain overrides
    q1, q2 = np.percentile(total, [35, 68])
    actions = []
    for t, e, r, f, c in zip(total, err, resp, fails, cpu):
        if t >= q2 or e >= 4.5 or (r >= 750 and c >= 75 and f >= 20):
            actions.append("Disable")
        elif t >= q1 or e >= 1.8 or r >= 320 or f >= 8:
            actions.append("Pause")
        else:
            actions.append("Continue")

    df = pd.DataFrame({
        "error_rate": np.round(err, 2),
        "response_time": np.round(resp, 1),
        "api_failures": fails,
        "user_adoption": np.round(adopt, 1),
        "cpu_usage": np.round(cpu, 1),
        "memory_usage": np.round(mem, 1),
        "rollout_percentage": roll,
        "action": actions
    })

    # Shuffle records
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    df.to_csv(filepath, index=False)
    return df


def train_and_save_model(csv_path=CSV_PATH, model_path=MODEL_PATH, random_state=42):
    """
    Loads rollout dataset, trains a Logistic Regression classifier,
    evaluates performance, and serializes pipeline and label mapping to model.pkl.
    """
    if not os.path.exists(csv_path):
        generate_rollout_dataset(csv_path, n_samples=500, random_state=random_state)

    df = pd.read_csv(csv_path)

    X = df[FEATURE_COLUMNS]
    y = df["action"]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # 80/20 train-test split with class stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=random_state, stratify=y_encoded
    )

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(
            max_iter=1000,
            C=1.0,
            random_state=random_state,
            solver="lbfgs"
        ))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, average="weighted"))
    recall = float(recall_score(y_test, y_pred, average="weighted"))
    f1 = float(f1_score(y_test, y_pred, average="weighted"))

    # Bundle pipeline, encoder, and metadata
    model_artifact = {
        "pipeline": pipeline,
        "label_encoder": label_encoder,
        "feature_names": FEATURE_COLUMNS,
        "classes": list(label_encoder.classes_),
        "metrics": {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1
        }
    }

    joblib.dump(model_artifact, model_path)

    print(f"Dataset Size: {len(df)} records")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")

    return model_artifact


if __name__ == "__main__":
    train_and_save_model()
