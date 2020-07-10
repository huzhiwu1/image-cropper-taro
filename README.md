## 基于taro的高性能图片裁剪组件

+ 支持移动
+ 支持旋转
+ 支持缩放
+ 可导出绘制的图片的本地地址

## 使用

1. 下载代码
2. 赋值`src/components/ImageCropper` 下的文件到你的项目中
3. 引入`import ImageCropper from "@/components/ImageCropper"`
4. 使用`<ImageCropper imgSrc='xxx.png'>`

## 参数说明

| 属性       | 类型   | 描述                 | 必填 |
| ---------- | ------ | -------------------- | ---- |
| imgSrc     | String | 图片地址             | 是   |
| cut_ratio  | Number | 裁剪框的 宽/高 比    | 否   |
| img_height | Number | 图片的高度           | 否   |
| img_width  | Number | 图片的宽度           | 否   |
| img_left   | Number | 图片相对屏幕的左边距 | 否   |
| img_top    | Number | 图片相对屏幕的上边距 | 否   |

## 如何拿到绘制的图片地址

```
class demo extend Component{
    constructor(props){
        super(props)
        this.imageCropper = Taro.createRef()
    }
    async handleGetImg(){
        let result = await this.imageCropper.current._getImg()
        //result==
        //{  errMsg: "canvasToTempFilePath:ok"
        // tempFilePath: "xxx.png" }
        // tempFilePath即是地址
    }
    render(){
        return <ImageCropper	ref={this.imageCropper}/>
    }
}
```

## 结语

如果觉得，这个组件对你有帮助的话，请点个start吧，谢谢