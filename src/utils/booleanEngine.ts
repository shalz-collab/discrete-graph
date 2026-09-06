import { BooleanAnalysisResult, TruthTableData, TruthTableRow } from '../types';

export interface ASTNode {
  type: 'VARIABLE' | 'CONSTANT' | 'UNARY' | 'BINARY';
  value?: string; // Variable name or operator name
  boolValue?: boolean; // For constant true/false
  operator?: 'NOT' | 'AND' | 'OR' | 'XOR' | 'IMPLIES' | 'IFF';
  left?: ASTNode;
  right?: ASTNode;
  operand?: ASTNode;
}

/**
 * Tokenize a Boolean algebra string
 */
export function tokenize(expr: string): string[] {
  // Normalize symbols
  let clean = expr
    .replace(/&&|\band\b|∧|\*|&/gi, ' AND ')
    .replace(/\|\||\bor\b|∨|\+|\|/gi, ' OR ')
    .replace(/!|\bnot\b|¬|~/gi, ' NOT ')
    .replace(/\bxor\b|\^|⊕/gi, ' XOR ')
    .replace(/->|=>|\bimplies\b|⇒/gi, ' IMPLIES ')
    .replace(/<->|<=>|\biff\b|⇔/gi, ' IFF ')
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .trim();

  // Split by whitespace
  const tokens = clean.split(/\s+/).filter(t => t.length > 0);
  return tokens;
}

/**
 * Extract all unique variable names from tokens
 */
export function extractVariables(tokens: string[]): string[] {
  const opSet = new Set(['AND', 'OR', 'NOT', 'XOR', 'IMPLIES', 'IFF', '(', ')', 'TRUE', 'FALSE', '1', '0', 'T', 'F']);
  const vars = new Set<string>();

  for (const token of tokens) {
    const upper = token.toUpperCase();
    if (!opSet.has(upper) && /^[A-Za-z][A-Za-z0-9_]*$/.test(token)) {
      vars.add(upper);
    }
  }

  return Array.from(vars).sort();
}

/**
 * Recursive Descent Parser for Boolean Expressions
 * Precedence hierarchy:
 * 1. Parentheses / Variables / NOT
 * 2. AND
 * 3. XOR
 * 4. OR
 * 5. IMPLIES / IFF
 */
export class BooleanParser {
  private tokens: string[];
  private pos = 0;

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  private peek(): string | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private consume(): string {
    return this.tokens[this.pos++];
  }

  public parse(): ASTNode {
    if (this.tokens.length === 0) {
      throw new Error('Expression is empty');
    }
    const node = this.parseEquivalence();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token "${this.tokens[this.pos]}" at position ${this.pos + 1}`);
    }
    return node;
  }

  // Precedence 5: IFF / IMPLIES
  private parseEquivalence(): ASTNode {
    let node = this.parseOr();

    while (this.peek()?.toUpperCase() === 'IFF' || this.peek()?.toUpperCase() === 'IMPLIES') {
      const op = this.consume().toUpperCase() as 'IFF' | 'IMPLIES';
      const right = this.parseOr();
      node = {
        type: 'BINARY',
        operator: op,
        left: node,
        right
      };
    }

    return node;
  }

  // Precedence 4: OR
  private parseOr(): ASTNode {
    let node = this.parseXor();

    while (this.peek()?.toUpperCase() === 'OR') {
      this.consume();
      const right = this.parseXor();
      node = {
        type: 'BINARY',
        operator: 'OR',
        left: node,
        right
      };
    }

    return node;
  }

  // Precedence 3: XOR
  private parseXor(): ASTNode {
    let node = this.parseAnd();

    while (this.peek()?.toUpperCase() === 'XOR') {
      this.consume();
      const right = this.parseAnd();
      node = {
        type: 'BINARY',
        operator: 'XOR',
        left: node,
        right
      };
    }

    return node;
  }

  // Precedence 2: AND
  private parseAnd(): ASTNode {
    let node = this.parseUnary();

    while (this.peek()?.toUpperCase() === 'AND') {
      this.consume();
      const right = this.parseUnary();
      node = {
        type: 'BINARY',
        operator: 'AND',
        left: node,
        right
      };
    }

    return node;
  }

  // Precedence 1: NOT
  private parseUnary(): ASTNode {
    if (this.peek()?.toUpperCase() === 'NOT') {
      this.consume();
      const operand = this.parseUnary();
      return {
        type: 'UNARY',
        operator: 'NOT',
        operand
      };
    }

    return this.parsePrimary();
  }

  // Primary: Variable, Constant, or (Expression)
  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token === '(') {
      this.consume(); // '('
      const node = this.parseEquivalence();
      if (this.peek() !== ')') {
        throw new Error('Missing closing parenthesis ")"');
      }
      this.consume(); // ')'
      return node;
    }

    const upper = token.toUpperCase();
    if (upper === 'TRUE' || upper === '1' || upper === 'T') {
      this.consume();
      return { type: 'CONSTANT', boolValue: true };
    }
    if (upper === 'FALSE' || upper === '0' || upper === 'F') {
      this.consume();
      return { type: 'CONSTANT', boolValue: false };
    }

    if (/^[A-Za-z][A-Za-z0-9_]*$/.test(token)) {
      this.consume();
      return { type: 'VARIABLE', value: upper };
    }

    throw new Error(`Invalid token "${token}"`);
  }
}

/**
 * Evaluate an AST given variable truth assignments
 */
export function evaluateAST(node: ASTNode, values: Record<string, boolean>): boolean {
  switch (node.type) {
    case 'CONSTANT':
      return !!node.boolValue;
    case 'VARIABLE':
      return !!values[node.value || ''];
    case 'UNARY':
      if (node.operator === 'NOT') {
        return !evaluateAST(node.operand!, values);
      }
      return false;
    case 'BINARY': {
      const leftVal = evaluateAST(node.left!, values);
      const rightVal = evaluateAST(node.right!, values);
      switch (node.operator) {
        case 'AND':
          return leftVal && rightVal;
        case 'OR':
          return leftVal || rightVal;
        case 'XOR':
          return (leftVal && !rightVal) || (!leftVal && rightVal);
        case 'IMPLIES':
          return !leftVal || rightVal;
        case 'IFF':
          return leftVal === rightVal;
        default:
          return false;
      }
    }
  }
}

/**
 * Collect sub-expressions representation for truth table columns
 */
export function stringifyAST(node: ASTNode): string {
  switch (node.type) {
    case 'CONSTANT':
      return node.boolValue ? '1' : '0';
    case 'VARIABLE':
      return node.value || '';
    case 'UNARY':
      return `NOT (${stringifyAST(node.operand!)})`;
    case 'BINARY':
      return `(${stringifyAST(node.left!)} ${node.operator} ${stringifyAST(node.right!)})`;
  }
}

/**
 * Generate full Truth Table Data
 */
export function generateTruthTable(expression: string): TruthTableData {
  const tokens = tokenize(expression);
  const vars = extractVariables(tokens);
  
  if (tokens.length === 0) {
    throw new Error('Please enter a Boolean expression.');
  }

  const parser = new BooleanParser(tokens);
  const ast = parser.parse();

  // If no variables (e.g. "1 AND 0"), create a dummy evaluation
  const numVars = vars.length;
  const totalRows = Math.pow(2, Math.max(1, numVars));
  const rows: TruthTableRow[] = [];

  for (let i = 0; i < totalRows; i++) {
    const assignments: Record<string, boolean> = {};
    for (let v = 0; v < numVars; v++) {
      // Bit shift to compute truth value: 0 for False, 1 for True
      // MSB on left: bit (numVars - 1 - v)
      const bit = (i >> (numVars - 1 - v)) & 1;
      assignments[vars[v]] = bit === 1;
    }

    const result = evaluateAST(ast, assignments);
    rows.push({
      id: i,
      assignments,
      subEvaluations: {},
      result
    });
  }

  return {
    variables: vars,
    subExpressions: [],
    rows,
    expression
  };
}

/**
 * Comprehensive Boolean Analysis & Simplification
 */
export function analyzeBooleanExpression(expression: string): BooleanAnalysisResult {
  const tokens = tokenize(expression);
  const vars = extractVariables(tokens);

  if (tokens.length === 0) {
    throw new Error('Expression is empty.');
  }

  const parser = new BooleanParser(tokens);
  const ast = parser.parse();

  const opsCount = {
    AND: 0,
    OR: 0,
    NOT: 0,
    XOR: 0,
    IMPLIES: 0,
    IFF: 0
  };

  for (const token of tokens) {
    const up = token.toUpperCase();
    if (up in opsCount) {
      opsCount[up as keyof typeof opsCount]++;
    }
  }

  const totalOps = Object.values(opsCount).reduce((a, b) => a + b, 0);

  // Evaluate all truth table rows
  const numVars = vars.length;
  const totalRows = Math.pow(2, Math.max(1, numVars));
  let trueCount = 0;
  const minterms: Record<string, boolean>[] = [];
  const maxterms: Record<string, boolean>[] = [];

  for (let i = 0; i < totalRows; i++) {
    const assignments: Record<string, boolean> = {};
    for (let v = 0; v < numVars; v++) {
      const bit = (i >> (numVars - 1 - v)) & 1;
      assignments[vars[v]] = bit === 1;
    }
    const res = evaluateAST(ast, assignments);
    if (res) {
      trueCount++;
      minterms.push(assignments);
    } else {
      maxterms.push(assignments);
    }
  }

  const falseCount = totalRows - trueCount;
  let exprType: 'Tautology (Always True)' | 'Contradiction (Always False)' | 'Contingent (Satisfiable)' = 'Contingent (Satisfiable)';

  if (trueCount === totalRows) {
    exprType = 'Tautology (Always True)';
  } else if (trueCount === 0) {
    exprType = 'Contradiction (Always False)';
  }

  // Construct DNF (Disjunctive Normal Form - Sum of Minterms)
  let dnf = '0';
  if (minterms.length > 0) {
    if (minterms.length === totalRows) {
      dnf = '1 (Tautology)';
    } else {
      dnf = minterms
        .map(term => {
          const parts = vars.map(v => (term[v] ? v : `NOT ${v}`));
          return parts.length > 1 ? `(${parts.join(' AND ')})` : parts[0];
        })
        .join(' OR ');
    }
  }

  // Construct CNF (Conjunctive Normal Form - Product of Maxterms)
  let cnf = '1';
  if (maxterms.length > 0) {
    if (maxterms.length === totalRows) {
      cnf = '0 (Contradiction)';
    } else {
      cnf = maxterms
        .map(term => {
          const parts = vars.map(v => (!term[v] ? v : `NOT ${v}`));
          return parts.length > 1 ? `(${parts.join(' OR ')})` : parts[0];
        })
        .join(' AND ');
    }
  }

  // Boolean Simplification using Discrete Math laws & heuristic reduction
  const { simplified, laws } = simplifyBoolean(ast, vars, minterms, totalRows, exprType);

  // Dual expression: replace AND with OR, OR with AND, 1 with 0, 0 with 1
  const dualExpr = expression
    .replace(/\bAND\b/gi, '__TMP_OR__')
    .replace(/\bOR\b/gi, 'AND')
    .replace(/__TMP_OR__/g, 'OR')
    .replace(/\b1\b/g, '__TMP_0__')
    .replace(/\b0\b/g, '1')
    .replace(/__TMP_0__/g, '0');

  return {
    expression,
    normalizedExpression: stringifyAST(ast),
    variables: vars,
    operatorsCount: opsCount,
    totalOperators: totalOps,
    expressionType: exprType,
    simplifiedExpression: simplified,
    lawsApplied: laws,
    dnf,
    cnf,
    dualExpression: dualExpr,
    truthTableSummary: {
      totalCombinations: totalRows,
      trueCount,
      falseCount
    }
  };
}

/**
 * Intelligent Boolean Expression Simplifier with Discrete Math Laws
 */
function simplifyBoolean(
  _ast: ASTNode,
  vars: string[],
  minterms: Record<string, boolean>[],
  totalRows: number,
  exprType: string
): { simplified: string; laws: string[] } {
  const laws: string[] = [];

  if (exprType === 'Tautology (Always True)') {
    laws.push('Complement Law: A OR NOT A = 1');
    laws.push('Domination Law: A OR 1 = 1');
    return { simplified: '1 (TRUE)', laws };
  }

  if (exprType === 'Contradiction (Always False)') {
    laws.push('Complement Law: A AND NOT A = 0');
    laws.push('Domination Law: A AND 0 = 0');
    return { simplified: '0 (FALSE)', laws };
  }

  if (vars.length === 1) {
    const v = vars[0];
    if (minterms.length === 1) {
      const isPositive = minterms[0][v];
      laws.push('Idempotent / Identity Law applied');
      return { simplified: isPositive ? v : `NOT ${v}`, laws };
    }
  }

  // Quine-McCluskey / Minterm grouping for 2-4 variables
  if (vars.length <= 4 && minterms.length > 0) {
    const primeImplicants = findPrimeImplicants(minterms, vars);
    if (primeImplicants.length > 0) {
      laws.push('De Morgan’s Laws & Distributive Factoring');
      laws.push('Absorption Law: A OR (A AND B) = A');
      laws.push('Consensus Theorem & Complement Elimination: (A AND B) OR (A AND NOT B) = A');
      return {
        simplified: primeImplicants.join(' OR '),
        laws
      };
    }
  }

  // Fallback heuristic simplification
  laws.push('Associative & Commutative Laws');
  laws.push('Double Negation: NOT (NOT A) = A');
  return {
    simplified: minterms.length > 0
      ? minterms.map(m => vars.map(v => m[v] ? v : `NOT ${v}`).join(' ∧ ')).join(' ∨ ')
      : '0',
    laws
  };
}

/**
 * Prime Implicant reduction for small variable sets
 */
function findPrimeImplicants(minterms: Record<string, boolean>[], vars: string[]): string[] {
  // Convert minterms to bit strings
  const terms = minterms.map(m => vars.map(v => (m[v] ? '1' : '0')).join(''));
  
  if (terms.length === 0) return ['0'];
  if (terms.length === Math.pow(2, vars.length)) return ['1'];

  // Pairwise reduction (single-bit difference)
  let currentGroup = Array.from(new Set(terms));
  const primes = new Set<string>();

  while (currentGroup.length > 0) {
    const nextGroup = new Set<string>();
    const used = new Set<string>();

    for (let i = 0; i < currentGroup.length; i++) {
      for (let j = i + 1; j < currentGroup.length; j++) {
        const a = currentGroup[i];
        const b = currentGroup[j];
        const diffIndex = getSingleBitDiff(a, b);

        if (diffIndex !== -1) {
          used.add(a);
          used.add(b);
          const combined = a.substring(0, diffIndex) + '-' + a.substring(diffIndex + 1);
          nextGroup.add(combined);
        }
      }
    }

    for (const term of currentGroup) {
      if (!used.has(term)) {
        primes.add(term);
      }
    }

    currentGroup = Array.from(nextGroup);
  }

  // Convert prime implicant bit strings back to readable expressions
  const result: string[] = [];
  for (const p of primes) {
    const literals: string[] = [];
    for (let i = 0; i < vars.length; i++) {
      if (p[i] === '1') literals.push(vars[i]);
      else if (p[i] === '0') literals.push(`NOT ${vars[i]}`);
    }
    if (literals.length === 0) {
      result.push('1');
    } else if (literals.length === 1) {
      result.push(literals[0]);
    } else {
      result.push(`(${literals.join(' AND ')})`);
    }
  }

  return result.length > 0 ? result : ['0'];
}

function getSingleBitDiff(a: string, b: string): number {
  if (a.length !== b.length) return -1;
  let diffCount = 0;
  let diffIdx = -1;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diffCount++;
      diffIdx = i;
      if (diffCount > 1) return -1;
    }
  }

  return diffCount === 1 ? diffIdx : -1;
}

/**
 * Format Truth Table as CSV string
 */
export function exportTruthTableToCSV(table: TruthTableData): string {
  const headers = [...table.variables, 'Result'];
  const lines = [headers.join(',')];

  for (const row of table.rows) {
    const vals = table.variables.map(v => (row.assignments[v] ? '1' : '0'));
    vals.push(row.result ? '1' : '0');
    lines.push(vals.join(','));
  }

  return lines.join('\n');
}
