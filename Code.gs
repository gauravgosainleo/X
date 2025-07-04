// Replace with your OpenAI Whisper API key
const OPENAI_API_KEY = 'sk-…';

/**
 * Receives JSON { base64Data, mimeType } and
 * returns { text } via Whisper.
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const transcript = transcribeAudio(data.base64Data, data.mimeType);

  return ContentService
    .createTextOutput(JSON.stringify({ text: transcript }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * (same as before) Decode base64, call Whisper, return text.
 */
function transcribeAudio(base64Data, mimeType) {
  const bytes = Utilities.base64Decode(base64Data);
  const cleanMime = mimeType.split(';')[0];
  const ext       = cleanMime.split('/')[1];
  const blob      = Utilities.newBlob(bytes, cleanMime, 'recording.' + ext);

  const formData = {
    model: 'whisper-1',
    file: blob
  };
  const opts = {
    method: 'post',
    payload: formData,
    headers: { Authorization: 'Bearer ' + OPENAI_API_KEY },
    muteHttpExceptions: true
  };

  const resp = UrlFetchApp.fetch('https://api.openai.com/v1/audio/transcriptions', opts);
  if (resp.getResponseCode() !== 200) {
    throw new Error('Whisper API error: ' + resp.getContentText());
  }
  const json = JSON.parse(resp.getContentText());
  return json.text || '';
}
