<GameFile>
  <PropertyGroup Name="HotNewGUI" Type="Scene" ID="a42c10db-bfd5-4a49-b3be-7dafb2146336" Version="3.10.0.0" />
  <Content ctype="GameProjectContent">
    <Content>
      <Animation Duration="0" Speed="1.0000" />
      <ObjectData Name="Scene" Tag="78" ctype="GameNodeObjectData">
        <Size X="1200.0000" Y="720.0000" />
        <Children>
          <AbstractNodeData Name="btnHide" ActionTag="2127767192" Tag="79" IconVisible="False" HorizontalEdge="BothEdge" VerticalEdge="BothEdge" TouchEnable="True" StretchWidthEnable="True" StretchHeightEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="5" BottomEage="5" Scale9OriginX="-15" Scale9OriginY="-5" Scale9Width="30" Scale9Height="10" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
            <Size X="1200.0000" Y="720.0000" />
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="600.0000" Y="360.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.5000" Y="0.5000" />
            <PreSize X="1.0000" Y="1.0000" />
            <TextColor A="255" R="65" G="65" B="70" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="pNews" ActionTag="-366932270" UserData="scale" Tag="67" IconVisible="False" PercentHeightEnable="True" PercentHeightEnabled="True" HorizontalEdge="LeftEdge" VerticalEdge="BothEdge" RightMargin="525.0000" ClipAble="False" BackColorAlpha="0" ComboBoxIndex="1" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="675.0000" Y="720.0000" />
            <Children>
              <AbstractNodeData Name="fog" ActionTag="-1919046756" Tag="119" IconVisible="False" PositionPercentYEnabled="True" PercentWidthEnable="True" PercentHeightEnable="True" PercentWidthEnabled="True" PercentHeightEnabled="True" LeftMargin="1.1765" RightMargin="-263.0090" TopMargin="-74.9880" BottomMargin="-254.9880" LeftEage="204" RightEage="204" TopEage="231" BottomEage="231" Scale9OriginX="204" Scale9OriginY="231" Scale9Width="211" Scale9Height="238" ctype="ImageViewObjectData">
                <Size X="936.8325" Y="1049.9760" />
                <AnchorPoint ScaleY="0.5000" />
                <Position X="1.1765" Y="270.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.0017" Y="0.3750" />
                <PreSize X="1.3879" Y="1.4583" />
                <FileData Type="Normal" Path="HotNews/fog.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="bg" ActionTag="-1292657706" Alpha="242" UserData="scale" Tag="81" IconVisible="False" PositionPercentYEnabled="True" HorizontalEdge="LeftEdge" RightMargin="-25.0000" LeftEage="210" RightEage="210" TopEage="231" BottomEage="231" Scale9OriginX="210" Scale9OriginY="231" Scale9Width="311" Scale9Height="258" ctype="ImageViewObjectData">
                <Size X="700.0000" Y="720.0000" />
                <Children>
                  <AbstractNodeData Name="Image_1" ActionTag="-2120767884" Tag="20" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="685.9698" RightMargin="-80.9698" TopMargin="299.7196" BottomMargin="310.2804" LeftEage="31" RightEage="31" TopEage="36" BottomEage="36" Scale9OriginX="31" Scale9OriginY="36" Scale9Width="33" Scale9Height="38" ctype="ImageViewObjectData">
                    <Size X="95.0000" Y="110.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="685.9698" Y="365.2804" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.9800" Y="0.5073" />
                    <PreSize X="0.1357" Y="0.1528" />
                    <FileData Type="Normal" Path="HotNews/btnClose.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="noNews" ActionTag="-641011798" Tag="98" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="300.5000" RightMargin="300.5000" TopMargin="273.5000" BottomMargin="345.5000" LeftEage="32" RightEage="32" TopEage="33" BottomEage="33" Scale9OriginX="32" Scale9OriginY="33" Scale9Width="35" Scale9Height="35" ctype="ImageViewObjectData">
                    <Size X="99.0000" Y="101.0000" />
                    <Children>
                      <AbstractNodeData Name="Text_1" ActionTag="-1147923225" Tag="99" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="-116.5000" RightMargin="-116.5000" TopMargin="98.5000" BottomMargin="-38.5000" FontSize="30" LabelText="Chưa có thông báo mới" HorizontalAlignmentType="HT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                        <Size X="332.0000" Y="41.0000" />
                        <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                        <Position X="49.5000" Y="-18.0000" />
                        <Scale ScaleX="1.0000" ScaleY="1.0000" />
                        <CColor A="255" R="103" G="96" B="123" />
                        <PrePosition X="0.5000" Y="-0.1782" />
                        <PreSize X="3.3535" Y="0.4059" />
                        <FontResource Type="Normal" Path="Font/tahoma.ttf" Plist="" />
                        <OutlineColor A="255" R="255" G="0" B="0" />
                        <ShadowColor A="255" R="110" G="110" B="110" />
                      </AbstractNodeData>
                    </Children>
                    <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                    <Position X="350.0000" Y="396.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.5500" />
                    <PreSize X="0.1414" Y="0.1403" />
                    <FileData Type="Normal" Path="HotNews/noNews.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleY="0.5000" />
                <Position Y="360.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition Y="0.5000" />
                <PreSize X="1.0370" Y="1.0000" />
                <FileData Type="Normal" Path="HotNews/bgHotNew.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="listBanner" ActionTag="-1768780484" Tag="82" IconVisible="False" HorizontalEdge="BothEdge" VerticalEdge="TopEdge" LeftMargin="5.7375" RightMargin="-10.7375" TopMargin="4.5371" BottomMargin="5.4629" TouchEnable="True" ClipAble="True" BackColorAlpha="102" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" IsBounceEnabled="True" ScrollDirectionType="0" ItemMargin="10" DirectionType="Vertical" HorizontalType="Align_HorizontalCenter" ctype="ListViewObjectData">
                <Size X="680.0000" Y="710.0000" />
                <AnchorPoint />
                <Position X="5.7375" Y="5.4629" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.0085" Y="0.0076" />
                <PreSize X="1.0074" Y="0.9861" />
                <SingleColor A="255" R="150" G="150" B="255" />
                <FirstColor A="255" R="150" G="150" B="255" />
                <EndColor A="255" R="255" G="255" B="255" />
                <ColorVector ScaleY="1.0000" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleY="0.5000" />
            <Position Y="360.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition Y="0.5000" />
            <PreSize X="0.5625" Y="1.0000" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
        </Children>
      </ObjectData>
    </Content>
  </Content>
</GameFile>