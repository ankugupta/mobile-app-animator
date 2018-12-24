/**
 * Book object as saved in DB
 */
export interface BookEntity {
    bookId: string;
    title: string;
    imageUrl: string;
    publisherName: string;
    schoolClass: string;
    subject: string;
    targetDATUrl: string;
    targetXMLUrl: string;
    noOfVideos: number;
    noOfActivities: number;
    pageCount?: number; 
    lastUsedTime?: number;
}