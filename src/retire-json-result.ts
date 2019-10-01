import compareVersions from 'compare-versions';

export interface RetireJSONResult {
    data: {
        file: string;
        results: {
            version: string;
            component: string;
            detection: string;
            vulnerabilities: {
                below: string;
                atOrAbove: string;
                severity: string;
            }[];
        }[];
    }[];
}

export interface ComponentResult {
    currentLowestVersion: string;
    minimumRequiredVersion: string;
    highestSeverity: string;
}

export class Severity {
    severity: string;
    value: number;

    constructor(severity: string) {
        if (severity === "low") {
            this.value = 1;
        } else if (severity === "medium") {
            this.value = 2;
        } else if (severity === "high") {
            this.value = 3;
        } else if (severity === "critical") {
            this.value = 4;
        } else {
            throw new Error(`Could not understand severity: ${severity}`);
        }
        this.severity = severity;
    }

    isMoreSevereThan(severity: Severity): boolean {
        return this.value > severity.value;
    }
}

export function analyseRetireJSONResult(result: RetireJSONResult) {
    const components: Map<string, ComponentResult> = new Map<string, ComponentResult>();

    result.data.forEach(data => {
        data.results.forEach(result => {
            result.vulnerabilities.forEach(vulnerability => {
                const id = `${result.component}-${result.detection}`;

                if (!components.has(id)) {
                    components.set(id, {
                        currentLowestVersion: result.version,
                        minimumRequiredVersion: vulnerability.below,
                        highestSeverity: vulnerability.severity
                    });
                }

                const currentState = components.get(id) as ComponentResult;

                if (compareVersions(result.version, currentState.currentLowestVersion) < 0) {
                    currentState.currentLowestVersion = result.version;
                }

                if (compareVersions(vulnerability.below, currentState.minimumRequiredVersion) > 0) {
                    currentState.minimumRequiredVersion = vulnerability.below;
                }

                const newSeverity = new Severity(vulnerability.severity);
                const currentHighestSeverity = new Severity(currentState.highestSeverity);

                if (newSeverity.isMoreSevereThan(currentHighestSeverity)) {
                    currentState.highestSeverity = newSeverity.severity;
                }

                components.set(id, currentState);
            })
        })
    })

    return components;
}


