export interface TimelineListItem {
  Title: string;
  CreationTimeStamp: string;
  IsDeleted: boolean;
  Id: string;
  TenantId: string;
  TimelineEvents: Array<any>
}