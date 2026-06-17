import { SensorReadings, RiskLevel } from '../types';

export interface DecisionTreeNode {
  featureIndex?: number; // 0: temp, 1: humidity, 2: co2, 3: ammonia
  threshold?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
  isLeaf: boolean;
  classProbabilities?: Record<RiskLevel, number>;
  prediction?: RiskLevel;
}

export class DecisionTreeClassifier {
  private maxDepth: number;
  private minSamplesSplit: number;
  public root: DecisionTreeNode | null = null;
  private featureImportances: number[] = [0, 0, 0, 0]; // relative reduction in Gini

  constructor(maxDepth = 8, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  public getFeatureImportances(): number[] {
    return this.featureImportances;
  }

  // Train a single tree
  public train(X: number[][], y: RiskLevel[], featureSubsetSize?: number): void {
    this.featureImportances = [0, 0, 0, 0];
    this.root = this.buildTree(X, y, 0, featureSubsetSize);
    
    // Normalize feature importances for this tree
    const sum = this.featureImportances.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      this.featureImportances = this.featureImportances.map(v => v / sum);
    }
  }

  private buildTree(X: number[][], y: RiskLevel[], depth: number, featureSubsetSize?: number): DecisionTreeNode {
    const numSamples = X.length;
    const numFeatures = X[0]?.length || 0;
    const uniqueClasses = Array.from(new Set(y));

    // Base cases
    if (
      depth >= this.maxDepth ||
      numSamples < this.minSamplesSplit ||
      uniqueClasses.length <= 1
    ) {
      return this.makeLeafNode(y);
    }

    // Determine features to scan (random subset for random forests)
    let featuresToScan = Array.from({ length: numFeatures }, (_, i) => i);
    if (featureSubsetSize && featureSubsetSize < numFeatures) {
      featuresToScan = this.shuffle(featuresToScan).slice(0, featureSubsetSize);
    }

    // Find best split
    let bestGain = -1;
    let bestFeature = -1;
    let bestThreshold = -1;
    let bestSplits: { leftX: number[][]; leftY: RiskLevel[]; rightX: number[][]; rightY: RiskLevel[] } | null = null;

    const parentGini = this.calculateGini(y);

    for (const featureIdx of featuresToScan) {
      // Sort unique thresholds
      const values = X.map(row => row[featureIdx]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
      
      // Candidate thresholds are midpoints
      const thresholds: number[] = [];
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        thresholds.push((uniqueValues[i] + uniqueValues[i + 1]) / 2);
      }

      for (const thr of thresholds) {
        const leftX: number[][] = [];
        const leftY: RiskLevel[] = [];
        const rightX: number[][] = [];
        const rightY: RiskLevel[] = [];

        for (let i = 0; i < numSamples; i++) {
          if (X[i][featureIdx] <= thr) {
            leftX.push(X[i]);
            leftY.push(y[i]);
          } else {
            rightX.push(X[i]);
            rightY.push(y[i]);
          }
        }

        if (leftY.length === 0 || rightY.length === 0) continue;

        const leftGini = this.calculateGini(leftY);
        const rightGini = this.calculateGini(rightY);
        const splitGini = (leftY.length / numSamples) * leftGini + (rightY.length / numSamples) * rightGini;
        const gain = parentGini - splitGini;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = featureIdx;
          bestThreshold = thr;
          bestSplits = { leftX, leftY, rightX, rightY };
        }
      }
    }

    // If no gain, make a leaf
    if (bestGain <= 0 || !bestSplits) {
      return this.makeLeafNode(y);
    }

    // Accumulate feature importance (total Gini reduction * proportion of samples)
    this.featureImportances[bestFeature] += bestGain * numSamples;

    // Split recursively
    const leftChild = this.buildTree(bestSplits.leftX, bestSplits.leftY, depth + 1, featureSubsetSize);
    const rightChild = this.buildTree(bestSplits.rightX, bestSplits.rightY, depth + 1, featureSubsetSize);

    return {
      isLeaf: false,
      featureIndex: bestFeature,
      threshold: bestThreshold,
      left: leftChild,
      right: rightChild,
    };
  }

  private makeLeafNode(y: RiskLevel[]): DecisionTreeNode {
    const total = y.length;
    const counts: Record<RiskLevel, number> = {
      'Healthy': 0,
      'Low Risk': 0,
      'Moderate Risk': 0,
      'High Disease Risk': 0
    };

    y.forEach(label => {
      counts[label] = (counts[label] || 0) + 1;
    });

    const probabilities: Record<RiskLevel, number> = {
      'Healthy': total > 0 ? counts['Healthy'] / total : 0,
      'Low Risk': total > 0 ? counts['Low Risk'] / total : 0,
      'Moderate Risk': total > 0 ? counts['Moderate Risk'] / total : 0,
      'High Disease Risk': total > 0 ? counts['High Disease Risk'] / total : 0,
    };

    // Winning class
    let bestClass: RiskLevel = 'Healthy';
    let bestCount = -1;
    (Object.keys(counts) as RiskLevel[]).forEach(c => {
      if (counts[c] > bestCount) {
        bestCount = counts[c];
        bestClass = c;
      }
    });

    return {
      isLeaf: true,
      classProbabilities: probabilities,
      prediction: bestClass,
    };
  }

  private calculateGini(y: RiskLevel[]): number {
    if (y.length === 0) return 0;
    const counts: Record<string, number> = {};
    y.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    let sumSquares = 0;
    const total = y.length;
    Object.keys(counts).forEach(key => {
      const p = counts[key] / total;
      sumSquares += p * p;
    });

    return 1 - sumSquares;
  }

  public predictProbabilities(x: number[]): Record<RiskLevel, number> {
    if (!this.root) {
      return { 'Healthy': 0.25, 'Low Risk': 0.25, 'Moderate Risk': 0.25, 'High Disease Risk': 0.25 };
    }
    return this.traverse(this.root, x);
  }

  private traverse(node: DecisionTreeNode, x: number[]): Record<RiskLevel, number> {
    if (node.isLeaf && node.classProbabilities) {
      return node.classProbabilities;
    }
    if (node.featureIndex !== undefined && node.threshold !== undefined) {
      if (x[node.featureIndex] <= node.threshold) {
        return this.traverse(node.left!, x);
      } else {
        return this.traverse(node.right!, x);
      }
    }
    return { 'Healthy': 1, 'Low Risk': 0, 'Moderate Risk': 0, 'High Disease Risk': 0 };
  }

  private shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

export class RandomForestClassifier {
  public trees: DecisionTreeClassifier[] = [];
  private numTrees: number;
  private maxDepth: number;
  private minSamplesSplit: number;
  private featureImportances: number[] = [0, 0, 0, 0];

  constructor(numTrees = 10, maxDepth = 6, minSamplesSplit = 2) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  public getFeatureImportances(): Record<string, number> {
    const features = ['temperature', 'humidity', 'co2', 'ammonia'];
    return {
      [features[0]]: this.featureImportances[0],
      [features[1]]: this.featureImportances[1],
      [features[2]]: this.featureImportances[2],
      [features[3]]: this.featureImportances[3],
    };
  }

  // Train the random forest using boot-bagging
  public train(X: number[][], y: RiskLevel[]): { accuracy: number; size: number } {
    this.trees = [];
    const nSamples = X.length;
    const nFeatures = X[0]?.length || 0;
    const subsetSize = Math.max(1, Math.round(Math.sqrt(nFeatures))); // standard sqrt(F)

    let totalFeatureImportances = [0, 0, 0, 0];

    for (let t = 0; t < this.numTrees; t++) {
      // Bootstrap sampling (with replacement)
      const bootX: number[][] = [];
      const bootY: RiskLevel[] = [];
      for (let s = 0; s < nSamples; s++) {
        const randIdx = Math.floor(Math.random() * nSamples);
        bootX.push(X[randIdx]);
        bootY.push(y[randIdx]);
      }

      const tree = new DecisionTreeClassifier(this.maxDepth, this.minSamplesSplit);
      tree.train(bootX, bootY, subsetSize);
      this.trees.push(tree);

      const treeImportances = tree.getFeatureImportances();
      for (let f = 0; f < nFeatures; f++) {
        totalFeatureImportances[f] += treeImportances[f];
      }
    }

    // Average feature importances
    const sum = totalFeatureImportances.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      this.featureImportances = totalFeatureImportances.map(v => v / sum);
    } else {
      this.featureImportances = [0.25, 0.25, 0.25, 0.25];
    }

    // Evaluate on original training set as Out-Of-Bag proxy
    let correct = 0;
    for (let i = 0; i < nSamples; i++) {
      const pred = this.predict(X[i]).riskLevel;
      if (pred === y[i]) correct++;
    }

    return {
      accuracy: correct / nSamples,
      size: this.trees.length,
    };
  }

  public predict(x: number[]): { riskLevel: RiskLevel; confidence: number; probabilities: Record<RiskLevel, number> } {
    const avgProbabilities: Record<RiskLevel, number> = {
      'Healthy': 0,
      'Low Risk': 0,
      'Moderate Risk': 0,
      'High Disease Risk': 0,
    };

    if (this.trees.length === 0) {
      // Default fallback
      return {
        riskLevel: 'Healthy',
        confidence: 1.0,
        probabilities: { 'Healthy': 1, 'Low Risk': 0, 'Moderate Risk': 0, 'High Disease Risk': 0 }
      };
    }

    // Accumulate probabilities across all trees
    this.trees.forEach(tree => {
      const probs = tree.predictProbabilities(x);
      (Object.keys(probs) as RiskLevel[]).forEach(cls => {
        avgProbabilities[cls] += probs[cls] / this.trees.length;
      });
    });

    // Find class with highest average probability
    let bestClass: RiskLevel = 'Healthy';
    let maxProb = -1;
    (Object.keys(avgProbabilities) as RiskLevel[]).forEach(cls => {
      if (avgProbabilities[cls] > maxProb) {
        maxProb = avgProbabilities[cls];
        bestClass = cls;
      }
    });

    return {
      riskLevel: bestClass,
      confidence: parseFloat(maxProb.toFixed(3)),
      probabilities: avgProbabilities,
    };
  }

  /**
   * Serialize model schema to JSON string to fulfill "train and save" constraint.
   */
  public saveToString(): string {
    return JSON.stringify({
      numTrees: this.numTrees,
      maxDepth: this.maxDepth,
      minSamplesSplit: this.minSamplesSplit,
      featureImportances: this.featureImportances,
      trees: this.trees.map(t => this.serializeNode(t.root))
    });
  }

  /**
   * Load Model schema from JSON
   */
  public loadFromString(jsonStr: string): void {
    const parsed = JSON.parse(jsonStr);
    this.numTrees = parsed.numTrees;
    this.maxDepth = parsed.maxDepth;
    this.minSamplesSplit = parsed.minSamplesSplit;
    this.featureImportances = parsed.featureImportances;
    
    this.trees = parsed.trees.map((treeRootJson: any) => {
      const tree = new DecisionTreeClassifier(this.maxDepth, this.minSamplesSplit);
      tree.root = this.deserializeNode(treeRootJson);
      return tree;
    });
  }

  private serializeNode(node: DecisionTreeNode | null | undefined): any {
    if (!node) return null;
    return {
      isLeaf: node.isLeaf,
      featureIndex: node.featureIndex,
      threshold: node.threshold,
      classProbabilities: node.classProbabilities,
      prediction: node.prediction,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right)
    };
  }

  private deserializeNode(json: any): DecisionTreeNode | null {
    if (!json) return null;
    const node: DecisionTreeNode = {
      isLeaf: json.isLeaf,
      featureIndex: json.featureIndex,
      threshold: json.threshold,
      classProbabilities: json.classProbabilities,
      prediction: json.prediction,
    };
    if (json.left) {
      node.left = this.deserializeNode(json.left) as DecisionTreeNode;
    }
    if (json.right) {
      node.right = this.deserializeNode(json.right) as DecisionTreeNode;
    }
    return node;
  }
}

/**
 * Generate standard synthetic agricultural dataset according to poultry guidelines.
 * This yields deep realistic boundaries that a decision forest can solve with Gini reduction!
 */
export function generatePoultryDataset(size = 180): { X: number[][]; y: RiskLevel[] } {
  const X: number[][] = [];
  const y: RiskLevel[] = [];

  const addPoint = (temp: number, hum: number, co2: number, amm: number, label: RiskLevel) => {
    X.push([temp, hum, co2, amm]);
    y.push(label);
  };

  // 1. Healthy Group (Ideal ranges for grown broilers)
  // Temp: 18-24°C, Humid: 50-68%, CO2: 400-1100ppm, Ammonia: 0-7ppm
  const numHealthy = Math.floor(size * 0.35);
  for (let i = 0; i < numHealthy; i++) {
    const t = 18 + Math.random() * 6; // 18-24
    const h = 50 + Math.random() * 18; // 50-68
    const c = 350 + Math.random() * 750; // 350-1100
    const a = Math.random() * 7; // 0-7
    addPoint(t, h, c, a, 'Healthy');
  }

  // 2. Low Risk (Slightly outside ideal parameters, or individual minor elevated factor)
  const numLowRisk = Math.floor(size * 0.25);
  for (let i = 0; i < numLowRisk; i++) {
    // Generate slight stress factor
    const factor = Math.floor(Math.random() * 4);
    let t = 19 + Math.random() * 4;
    let h = 55 + Math.random() * 10;
    let c = 500 + Math.random() * 600;
    let a = 2 + Math.random() * 5;

    if (factor === 0) {
      t = 25.5 + Math.random() * 2; // mild heat (25.5-27.5)
    } else if (factor === 1) {
      h = 70 + Math.random() * 5; // mild wetness (70-75%)
    } else if (factor === 2) {
      c = 1200 + Math.random() * 500; // mild CO2 (1200-1700)
    } else {
      a = 9 + Math.random() * 5; // mild ammonia (9-14 ppm)
    }
    addPoint(t, h, c, a, 'Low Risk');
  }

  // 3. Moderate Risk (Poor ventilation or substantial thermal deviations)
  const numModRisk = Math.floor(size * 0.20);
  for (let i = 0; i < numModRisk; i++) {
    const factor = Math.floor(Math.random() * 4);
    let t = 20 + Math.random() * 4;
    let h = 55 + Math.random() * 10;
    let c = 600 + Math.random() * 500;
    let a = 3 + Math.random() * 4;

    if (factor === 0) {
      t = 28 + Math.random() * 3.5; // high temp (28-31.5°C)
    } else if (factor === 1) {
      h = 76 + Math.random() * 4; // sticky humidity (76-80%)
    } else if (factor === 2) {
      c = 1800 + Math.random() * 800; // ventilation problem CO2 (1800-2600 ppm)
    } else {
      a = 15 + Math.random() * 9; // ammonia toxicity beginning (15-24 ppm)
    }
    addPoint(t, h, c, a, 'Moderate Risk');
  }

  // 4. High Disease Risk (Severe toxic concentrations or acute temperatures)
  const numHighRisk = Math.floor(size * 0.20);
  for (let i = 0; i < numHighRisk; i++) {
    const factor = Math.floor(Math.random() * 4);
    let t = 20 + Math.random() * 4;
    let h = 55 + Math.random() * 10;
    let c = 600 + Math.random() * 500;
    let a = 3 + Math.random() * 4;

    if (factor === 0) {
      t = 32.5 + Math.random() * 5; // critical heat stress or cold (<12)
    } else if (factor === 1) {
      h = 81 + Math.random() * 14; // dangerous moisture (81-95% triggering coccidiosis/bacteria)
    } else if (factor === 2) {
      c = 2800 + Math.random() * 1500; // asphyxiating CO2 levels (>2800 ppm)
    } else {
      a = 25.5 + Math.random() * 25; // severe ammonia toxicity (25.5-50 ppm damaging cornea and respiratory tissues)
    }
    addPoint(t, h, c, a, 'High Disease Risk');
  }

  // Add random variance across all points to simulate true data noise
  for (let i = 0; i < X.length; i++) {
    X[i][0] += (Math.random() - 0.5) * 0.5; // temperature noise
    X[i][1] += (Math.random() - 0.5) * 1.5; // humidity noise
    X[i][2] += (Math.random() - 0.5) * 50;  // CO2 noise
    X[i][3] += (Math.random() - 0.5) * 1.0; // Ammonia noise

    // clamp logical bounds
    X[i][0] = Math.max(5, Math.min(45, X[i][0]));
    X[i][1] = Math.max(10, Math.min(100, X[i][1]));
    X[i][2] = Math.max(100, Math.min(8000, X[i][2]));
    X[i][3] = Math.max(0, Math.min(100, X[i][3]));
  }

  return { X, y };
}
