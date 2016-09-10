-- This file is part of IVRE.
-- Copyright 2011 - 2016 Pierre LALET <pierre.lalet@cea.fr>
--
-- IVRE is free software: you can redistribute it and/or modify it
-- under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- IVRE is distributed in the hope that it will be useful, but WITHOUT
-- ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
-- or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public
-- License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with IVRE. If not, see <http://www.gnu.org/licenses/>.

local shortport = require "shortport"
local match = require "match"

description = [[

Gets a screenshot from a VNC server.

Imagemagick's convert tool must me installed somewhere in $PATH.

]]

author = "Pierre LALET <pierre@droids-corp.org>"
license = "GPLv3"
categories = {"discovery", "safe"}

---
-- @usage
-- nmap -n -p 5900 --script vnc-screenshot 1.2.3.4
--
-- @output
-- PORT   STATE SERVICE
-- 5900/tcp open  http
-- |_http-screenshot: Saved to screenshot-1.2.3.4-5900.jpg

portrule = shortport.port_or_service(5900, "vnc")

local function missing_data(buffer, height, width)
   for i=1, height do
      for j=1, width do
         if buffer[i][j] == nil then return true end
      end
   end
   return false
end

action = function(host, port)
  local socket = nmap.new_socket()
  local status, result, version
  local fname = ("screenshot-%s-%d.jpg"):format(host.ip, port.number)

  socket:connect(host, port)

  status, result = socket:receive_buf("\n", false)

  if not (status and result:match("^RFB %d%d%d.%d%d%d$")) then
    socket:close()
    return
  end

  version = result:sub(5)

  if version < "003.007" then
    version = "003.003"
  elseif version == "003.007" then
    version = "003.007"
  else
    version = "003.008"
  end

  socket:send(("RFB %s\n"):format(version))

  if version == "003.003" then
    status, result = socket:receive_buf(match.numbytes(4), true)
    if not status or result ~= "\000\000\000\001" then
      socket:close()
      return
    end
  else
    status, result = socket:receive_buf(match.numbytes(1), true)
    if not status then
      socket:close()
      return
    end
    status, result = socket:receive_buf(match.numbytes(result:byte()), true)
    if not status then
      socket:close()
      return
    end
    socket:send("\001")
    if version == "003.008" then
      status, result = socket:receive_buf(match.numbytes(4), true)
      if not status or result ~= "\000\000\000\000" then
        socket:close()
        return
      end
    end
  end

  socket:send("\001")
  status, result = socket:receive_buf(match.numbytes(24), true)
  if not status then
    socket:close()
    return
  end
  local width, height, bytes_per_pixel, depth, big_endian, true_color, red_max,
  green_max, blue_max, red_shift, green_shift, blue_shift, padding,
  desktop_name_len = (">I2I2BBBBI2I2I2BBBc3I4"):unpack(result)
  bytes_per_pixel = bytes_per_pixel // 8
  local desktop_name
  status, desktop_name = socket:receive_buf(match.numbytes(desktop_name_len), true)

  socket:send('\000\000\000\000' .. result:sub(5, 17) .. '\000\000\000' ..
                '\002\000\000\001\000\000\000\000\003\000\000\000\000\000' ..
                 result:sub(1, 4))

  local buffer = {}
  for i = 1, height do
    buffer[i] = {}
    for j = 1, width do
      buffer[i][j] = nil
    end
  end

  while missing_data(buffer, height, width) do
    local pix_r, pix_g, pix_b
    status, result = socket:receive_buf(match.numbytes(4), true)
    if result:sub(1, 1) == '\001' then
      status, result = socket:receive_buf(match.numbytes(2), true)
      if not status then
        socket:close()
        return
      end
      status, _ = socket:receive_buf(match.numbytes(6 * (">I2"):unpack(result)), true)
      if not status then
        socket:close()
        return
      end
      goto next
    end
    if result:sub(1, 1) ~= '\000' then
      socket:close()
      return
    end
    local count = (">I2"):unpack(result:sub(3))
    for ir = 1, count do
      status, result = socket:receive_buf(match.numbytes(12), true)
      if not status then
        socket:close()
        return
      end
      xpos, ypos, r_width, r_height, encoding = (">I2I2I2I2I4"):unpack(result)
      if encoding ~= 0 then
        socket:close()
        return
      end
      for ih = 1, r_height do
        for iw = 1, r_width do
	  status, result = socket:receive_buf(match.numbytes(bytes_per_pixel), true)
          if not status then
            socket:close()
            return
          end
          result = ("%sI%d"):format(big_endian == 0 and "<" or ">",
                                      bytes_per_pixel):unpack(result)
          pix_r = ((result >> red_shift) % (red_max + 1)) * 255 // red_max
          pix_g = ((result >> green_shift) % (green_max + 1)) * 255 // green_max
          pix_b = ((result >> blue_shift) % (blue_max + 1)) * 255 // blue_max
	  buffer[ypos + ih][xpos + iw] = ("BBB"):pack(pix_r, pix_g, pix_b)
	end
      end
    end
    ::next::
  end

  local f = assert(io.popen(
     ("convert -size %dx%d -depth 8 RGB:- %s"):format(
       width, height, fname), "w"
  ))
  local pixel
  for i = 1, height do
    for j = 1, width do
      pixel = buffer[i][j]
      if pixel == nil then
	f:write("\000\000\000")
      else
	f:write(buffer[i][j])
      end
    end
  end
  f:close()

  if os.rename(fname, fname) then
    return ("Saved to %s"):format(fname)
  end
end
