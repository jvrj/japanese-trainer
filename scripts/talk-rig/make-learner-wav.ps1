# Makes learner.wav / learner2.wav next to this script with Windows speech (file only, nothing plays).
# usage: powershell -File make-learner-wav.ps1
Add-Type -AssemblyName System.Speech
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(48000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
function Make($name, $parts) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $s.SetOutputToWaveFile((Join-Path $dir $name), $fmt)
  $b = New-Object System.Speech.Synthesis.PromptBuilder
  foreach ($p in $parts) { if ($p -is [int]) { $b.AppendBreak([TimeSpan]::FromSeconds($p)) } else { $b.AppendText($p) } }
  $s.Speak($b); $s.Dispose(); Write-Output ("wrote " + $name)
}
Make 'learner.wav'  @(6, 'konnichiwa', 5, 'Hello, I am Sam. How are you?', 6, 'ohayou gozaimasu', 6, 'what?', 8)
Make 'learner2.wav' @(7, 'konnichiwa, genki desu', 6, 'How do I say thank you in Japanese?', 7, 'slower please', 7, 'arigatou', 6, 'Can you explain that in English?', 8, 'What is the weather like in Tokyo?', 9)
