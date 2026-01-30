import { Media } from "../types";

/**
 * Interface representing a provider that can generate media recommendations.
 *
 * @interface IProvider
 */
export interface IProvider{
    recommendation(media: Media[] | null): Promise<string | null>
}