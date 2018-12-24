/**
 * Page object as recevied from server
 */
export interface Page {

    id: string;
    pageId: string;
    bookId: string;
    pageNoInBook: string;
    imageUrl: string;
    contentType: string;
    contentUrl: string
}