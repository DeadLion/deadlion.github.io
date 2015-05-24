---
title: 'Java byte[]（二进制）存储的图片转为jpg文件存储，并调整图片的宽高'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef7aeee2d88
tags:
    - Java
---


项目中需要将以二进制存储的在数据库中的图片转化为图片格式的文件直接存储在磁盘上。由于很多原图大小不一致，为了美观就直接将图片调整一个合适的宽高。

	    if (image != null) {  // byte[] image 就是你从数据库中拿到的数据
            InputStream inputStream = new ByteArrayInputStream(image);  //先转化为输入流
            try {
                BufferedImage img = ImageIO.read(inputStream);
                File file = new File("pathname");   ;  //设置文件路径
                
                BufferedImage newImg = new BufferedImage(110, 151, BufferedImage.TYPE_INT_RGB); //创建一个空白图片
                newImg.getGraphics().drawImage(img, 0, 0, 110, 151, null); //将原图片复制到新图片上并调整宽高
                ImageIO.write(newImg, "jpg", file);        //将转换后的图片写文件中,图片格式经测试jpg在保证质量的同时文件size也是最小的
                
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }  
		
