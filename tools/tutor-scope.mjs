// Conservative release filter. Private ingestion retains excluded records for audit.
export function tutorCandidate(row){
 if(row.route!=='ai_tutor'||row.secondary_route||row.author_kind==='ai_assistant')return false;
 if(!['query_or_request','unreviewed_root'].includes(row.message_kind))return false;
 const s=row.content??'';
 const operational=/\b(refund|invoice|coupon|enroll(?:ed|ment)?|subscription|certificate)\b|(?:schedule|plan).{0,30}(?:live |more )?sessions|(?:unable|cannot|can't|not able).{0,30}(?:access|download|play|purchase|login|log in)|(?:course|video|lesson).{0,25}(?:not (?:playing|opening|loading)|missing|unavailable)|(?:paid|payment).{0,25}(?:course|access)|(?:link|quiz).{0,20}(?:broken|not working)|(?:add|include|upload).{0,30}(?:topics|videos|content)/i;
 return !operational.test(s);
}
