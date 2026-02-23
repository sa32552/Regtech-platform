/**
 * Exception de base pour les erreurs métier
 */
export class BusinessException extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Exception pour les erreurs KYC
 */
export class KycException extends BusinessException {
  constructor(
    code: string,
    message: string,
    details?: any,
  ) {
    super(`KYC_${code}`, message, 400, details);
    this.name = 'KycException';
  }
}

/**
 * Exception pour les erreurs AML
 */
export class AmlException extends BusinessException {
  constructor(
    code: string,
    message: string,
    details?: any,
  ) {
    super(`AML_${code}`, message, 400, details);
    this.name = 'AmlException';
  }
}

/**
 * Exception pour les erreurs de documents
 */
export class DocumentException extends BusinessException {
  constructor(
    code: string,
    message: string,
    details?: any,
  ) {
    super(`DOC_${code}`, message, 400, details);
    this.name = 'DocumentException';
  }
}

/**
 * Exception pour les erreurs de règles
 */
export class RuleException extends BusinessException {
  constructor(
    code: string,
    message: string,
    details?: any,
  ) {
    super(`RULE_${code}`, message, 400, details);
    this.name = 'RuleException';
  }
}

/**
 * Exception pour les erreurs de workflow
 */
export class WorkflowException extends BusinessException {
  constructor(
    code: string,
    message: string,
    details?: any,
  ) {
    super(`WORKFLOW_${code}`, message, 400, details);
    this.name = 'WorkflowException';
  }
}

/**
 * Exception pour les erreurs de vérification de documents
 */
export class VerificationException extends BusinessException {
  constructor(
    code: string,
    message: string,
    details?: any,
  ) {
    super(`VERIF_${code}`, message, 400, details);
    this.name = 'VerificationException';
  }
}
