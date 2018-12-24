import { Page } from "./page";

/**
 * Book object as retrieved from server
 */
export interface Book {

    id?: string;
    bookId: string;
    title: string;
    author?: string;
    description?: string;
    imageUrl: string;
    publisherId?: string;
    publisherName: string
    schoolClass: string;
    subject: string;
    targetDATUrl: string;
    targetXMLUrl: string;
    noOfVideos: number;
    noOfActivities: number;
    pages: Page[]
}

