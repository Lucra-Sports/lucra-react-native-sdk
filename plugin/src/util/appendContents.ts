import {
  createGeneratedHeaderComment,
  type MergeResults,
  removeGeneratedContents,
} from '@expo/config-plugins/build/utils/generateCode';

export interface AppendContentsParams {
  src: string;
  newSrc: string;
  tag: string;
  comment: string;
}
export function appendContents({
  src,
  newSrc,
  tag,
  comment,
}: AppendContentsParams): MergeResults {
  const header = createGeneratedHeaderComment(newSrc, tag, comment);
  if (!src.includes(header)) {
    const sanitizedTarget = removeGeneratedContents(src, tag);
    const contentsToAdd = [
      // previous contents
      src,
      header,
      newSrc,
      // @end
      `${comment} @generated end ${tag}`,
    ].join('\n');

    return {
      contents: sanitizedTarget ?? contentsToAdd,
      didMerge: true,
      didClear: !!sanitizedTarget,
    };
  }

  return { contents: src, didClear: false, didMerge: false };
}
