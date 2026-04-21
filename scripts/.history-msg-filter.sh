#!/bin/sh
cat | awk '
BEGIN { skip=0 }
{
  line=$0
  if (line ~ /^Co-authored-by:/) next
  if (line ~ /AhmedAmer72/) next
  if (line ~ /ahmedamerr/) next
  if (line ~ /aamer1932002/) next
  print line
}'
