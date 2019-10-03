import compareVersions from 'compare-versions';
import chalk from 'chalk';

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
    affectedFiles: string[];
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
    const errors: any[] = [];

    for (let i = 0; i < result.data.length; i++) {
        const data = result.data[i];
        if (typeof data.results === 'undefined') {
            console.log(chalk.red('---'));
            console.log(chalk.red('skipping data missing results:'));
            console.log(data);
            console.log(chalk.red('---'));
            continue;
        }

        for (let i = 0; i < data.results.length; i++) {
            const result = data.results[i];
            if (typeof result.vulnerabilities === 'undefined') {
                console.log(chalk.red('---'));
                console.log(chalk.red('skipping result missing vulnerabilities:'));
                console.log(result);
                console.log(chalk.red('---'));
                continue;
            }
            for (let i = 0; i < result.vulnerabilities.length; i++) {
                const vulnerability = result.vulnerabilities[i];
                
                try {
                    const id = `${result.component}-${result.detection}`;

                    if (!components.has(id)) {
                        components.set(id, {
                            currentLowestVersion: result.version,
                            minimumRequiredVersion: vulnerability.below,
                            highestSeverity: vulnerability.severity,
                            affectedFiles: []
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

                    if (currentState.affectedFiles.findIndex(val => val === data.file) === -1) {
                        currentState.affectedFiles.push(data.file);
                    }
                    
                    components.set(id, currentState);
                } catch (e) {
                    errors.push({
                        error: e.toString(),
                        component: result.component,
                        version: result.version,
                        vulnerability: JSON.stringify(vulnerability)
                    });
                }
            }
        }
    }

    return { components, errors };
}


