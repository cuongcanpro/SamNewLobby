<GameFile>
  <PropertyGroup Name="WebviewUI" Type="Scene" ID="fb29942f-e241-4b33-a043-80fef21e0a9d" Version="3.10.0.0" />
  <Content ctype="GameProjectContent">
    <Content>
      <Animation Duration="0" Speed="1.0000" />
      <ObjectData Name="Scene" ctype="GameNodeObjectData">
        <Size X="1200.0000" Y="720.0000" />
        <Children>
          <AbstractNodeData Name="bar" ActionTag="-1110316362" UserData="scale" Tag="2" IconVisible="False" HorizontalEdge="BothEdge" VerticalEdge="TopEdge" BottomMargin="433.0000" StretchWidthEnable="True" LeftEage="260" RightEage="260" TopEage="15" BottomEage="15" Scale9OriginX="260" Scale9OriginY="15" Scale9Width="280" Scale9Height="17" ctype="ImageViewObjectData">
            <Size X="800.0000" Y="47.0000" />
            <AnchorPoint ScaleX="0.5000" ScaleY="1.0000" />
            <Position X="400.0000" Y="480.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.5000" Y="1.0000" />
            <PreSize X="1.0000" Y="0.0979" />
            <FileData Type="Normal" Path="Webview/bg_info.png" Plist="" />
          </AbstractNodeData>
          <AbstractNodeData Name="close" ActionTag="459488580" UserData="scale" Tag="3" IconVisible="False" HorizontalEdge="LeftEdge" VerticalEdge="TopEdge" LeftMargin="2.9398" RightMargin="752.0602" TopMargin="-0.3631" BottomMargin="433.3631" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="15" Scale9Height="25" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
            <Size X="45.0000" Y="47.0000" />
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="25.4398" Y="456.8631" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.0318" Y="0.9518" />
            <PreSize X="0.0562" Y="0.0979" />
            <TextColor A="255" R="65" G="65" B="70" />
            <DisabledFileData Type="Normal" Path="Webview/btn_quit.png" Plist="" />
            <PressedFileData Type="Normal" Path="Webview/btn_quit.png" Plist="" />
            <NormalFileData Type="Normal" Path="Webview/btn_quit.png" Plist="" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="reload" ActionTag="-1677124874" UserData="scale" Tag="4" IconVisible="False" HorizontalEdge="RightEdge" VerticalEdge="TopEdge" LeftMargin="752.3444" RightMargin="2.6556" TopMargin="1.2959" BottomMargin="433.7041" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="15" Scale9Height="23" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
            <Size X="45.0000" Y="45.0000" />
            <AnchorPoint ScaleX="0.5879" ScaleY="0.5650" />
            <Position X="778.7985" Y="459.1273" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.9735" Y="0.9565" />
            <PreSize X="0.0562" Y="0.0938" />
            <TextColor A="255" R="65" G="65" B="70" />
            <DisabledFileData Type="Normal" Path="Webview/icon_refresh.png" Plist="" />
            <PressedFileData Type="Normal" Path="Webview/icon_refresh.png" Plist="" />
            <NormalFileData Type="Normal" Path="Webview/icon_refresh.png" Plist="" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="title" ActionTag="1131072524" UserData="scale" Tag="5" IconVisible="False" HorizontalEdge="BothEdge" VerticalEdge="TopEdge" LeftMargin="58.9000" RightMargin="66.1000" TopMargin="1.0000" BottomMargin="434.0000" IsCustomSize="True" FontSize="18" LabelText="Text &#xA;Label" HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
            <Size X="675.0000" Y="45.0000" />
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="396.4000" Y="456.5000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.4955" Y="0.9510" />
            <PreSize X="0.8438" Y="0.0938" />
            <FontResource Type="Normal" Path="Font/tahoma.ttf" Plist="" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="web" ActionTag="1550618971" Tag="6" IconVisible="False" HorizontalEdge="BothEdge" VerticalEdge="BottomEdge" TopMargin="47.0000" TouchEnable="True" ClipAble="False" ComboBoxIndex="1" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="800.0000" Y="433.0000" />
            <Children>
              <AbstractNodeData Name="url" ActionTag="364079169" Tag="7" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="25.0000" RightMargin="25.0000" TopMargin="73.6246" BottomMargin="289.3754" IsCustomSize="True" FontSize="18" LabelText="Text &#xA;Label" HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="750.0000" Y="70.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="400.0000" Y="324.3754" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="0" G="0" B="0" />
                <PrePosition X="0.5000" Y="0.7491" />
                <PreSize X="0.9375" Y="0.1617" />
                <FontResource Type="Normal" Path="Font/tahoma.ttf" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="loading" ActionTag="-1879027112" Tag="8" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="343.5000" RightMargin="343.5000" TopMargin="188.3194" BottomMargin="131.6806" LeftEage="49" RightEage="49" TopEage="49" BottomEage="49" Scale9OriginX="49" Scale9OriginY="49" Scale9Width="15" Scale9Height="15" ctype="ImageViewObjectData">
                <Size X="113.0000" Y="113.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="400.0000" Y="188.1806" />
                <Scale ScaleX="0.7500" ScaleY="0.7500" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.4346" />
                <PreSize X="0.1412" Y="0.2610" />
                <FileData Type="Normal" Path="Webview/loading.png" Plist="" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" />
            <Position X="400.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.5000" />
            <PreSize X="1.0000" Y="0.9021" />
            <SingleColor A="255" R="255" G="255" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
        </Children>
      </ObjectData>
    </Content>
  </Content>
</GameFile>