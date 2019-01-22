export enum InvitationStatus {
  New,
  Invited = 'invited',
  InvitationPending = 'unsent',
  InvitationFailed = 'undelivered',
  Accepted = 'accepted'
}

// Invited Client information

export interface ClientInvitation {
  name?: string;
  phone: string;
  status?: InvitationStatus;
  invite_target?: InviteTarget;
}

export interface InvitationsResponse {
  invitations: ClientInvitation[];
}

export enum InviteTarget {
  stylist = 'stylist',
  client = 'client'
}
