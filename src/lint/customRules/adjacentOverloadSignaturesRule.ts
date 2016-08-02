import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';

export class Rule extends Lint.Rules.AbstractRule {

    public static FAILURE_STRING_FACTORY = (name: string) => `All '${name}' signatures should be adjacent`;

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new AdjacentOverloadSignaturesWalker(sourceFile, this.getOptions()));
    }
}

class AdjacentOverloadSignaturesWalker extends Lint.RuleWalker {

    public visitInterfaceDeclaration(node: ts.InterfaceDeclaration): void {
        this.checkNode(node);
        super.visitInterfaceDeclaration(node);
    }

    public visitTypeLiteral(node: ts.TypeLiteralNode): void {
        this.checkNode(node);
        super.visitTypeLiteral(node);
    }

    public checkNode(node: ts.TypeLiteralNode | ts.InterfaceDeclaration) {
        let last: string = undefined;
        const seen: { [name: string]: boolean } = {};
        for (const member of node.members) {
            if (member.name !== undefined) {
                const methodName = getTextOfPropertyName(member.name);
                if (methodName !== undefined) {
                    if (getProperty(seen, methodName) && last !== methodName) {
                        this.addFailure(this.createFailure(member.getStart(), member.getWidth(),
                        Rule.FAILURE_STRING_FACTORY(methodName)));
                    }
                    last = methodName;
                    seen[methodName] = true;
                }
            } else {
                last = undefined;
            }
        }
    }
}

function isLiteralExpression(node: ts.Node): node is ts.LiteralExpression {
    return node.kind === ts.SyntaxKind.StringLiteral || node.kind === ts.SyntaxKind.NumericLiteral;
}

function getTextOfPropertyName(name: ts.PropertyName): string {
    switch (name.kind) {
        case ts.SyntaxKind.Identifier:
            return (name as ts.Identifier).text;
        case ts.SyntaxKind.ComputedPropertyName:
            const { expression } = (name as ts.ComputedPropertyName);
            if (isLiteralExpression(expression)) {
                return expression.text;
            }
            break;
        default:
            if (isLiteralExpression(name)) {
                return name.text;
            }
    }
}

function getProperty(map: { [name: string]: boolean }, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
}
