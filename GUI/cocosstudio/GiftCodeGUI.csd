<GameFile>
  <PropertyGroup Name="GiftCodeGUI" Type="Scene" ID="a57aa16f-90d8-4da5-8cb7-49808dc144b0" Version="3.10.0.0" />
  <Content ctype="GameProjectContent">
    <Content>
      <Animation Duration="0" Speed="1.0000" />
      <ObjectData Name="Scene" Tag="214" ctype="GameNodeObjectData">
        <Size X="1200.0000" Y="720.0000" />
        <Children>
          <AbstractNodeData Name="bg" ActionTag="1967623096" UserData="scale" Tag="215" IconVisible="False" HorizontalEdge="BothEdge" VerticalEdge="BothEdge" LeftMargin="123.5200" RightMargin="136.4800" TopMargin="28.0880" BottomMargin="53.9120" Scale9Width="540" Scale9Height="395" ctype="ImageViewObjectData">
            <Size X="540.0000" Y="398.0000" />
            <Children>
              <AbstractNodeData Name="title" ActionTag="-2037333418" Tag="255" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="204.0000" RightMargin="204.0000" TopMargin="21.3519" BottomMargin="333.6481" ctype="SpriteObjectData">
                <Size X="132.0000" Y="43.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="270.0000" Y="355.1481" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.8923" />
                <PreSize X="0.2444" Y="0.1080" />
                <FileData Type="Normal" Path="GiftCodeGUI/_0003_Layer-3.png" Plist="" />
                <BlendFunc Src="770" Dst="771" />
              </AbstractNodeData>
              <AbstractNodeData Name="btnClose" ActionTag="922623013" Tag="217" IconVisible="False" LeftMargin="486.2169" RightMargin="7.7831" TopMargin="7.9041" BottomMargin="343.0959" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="16" Scale9Height="25" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
                <Size X="46.0000" Y="47.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="509.2169" Y="366.5959" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.9430" Y="0.9211" />
                <PreSize X="0.0852" Y="0.1181" />
                <TextColor A="255" R="65" G="65" B="70" />
                <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
                <PressedFileData Type="Normal" Path="Common/btnClose.png" Plist="" />
                <NormalFileData Type="Normal" Path="Common/btnClose.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="panelGift" ActionTag="284907699" VisibleForFrame="False" Tag="220" IconVisible="False" LeftMargin="20.8365" RightMargin="28.1635" TopMargin="93.9588" BottomMargin="46.0412" Scale9Width="471" Scale9Height="217" ctype="ImageViewObjectData">
                <Size X="491.0000" Y="258.0000" />
                <Children>
                  <AbstractNodeData Name="listGift" ActionTag="1058120314" Tag="229" IconVisible="False" LeftMargin="11.7389" RightMargin="-0.7389" TopMargin="59.6898" BottomMargin="-12.6898" TouchEnable="True" ClipAble="False" BackColorAlpha="0" ComboBoxIndex="1" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
                    <Size X="480.0000" Y="211.0000" />
                    <AnchorPoint />
                    <Position X="11.7389" Y="-12.6898" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.0239" Y="-0.0492" />
                    <PreSize X="0.9776" Y="0.8178" />
                    <SingleColor A="255" R="150" G="200" B="255" />
                    <FirstColor A="255" R="150" G="200" B="255" />
                    <EndColor A="255" R="255" G="255" B="255" />
                    <ColorVector ScaleY="1.0000" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="lbNotice" ActionTag="270547403" Tag="437" IconVisible="False" HorizontalEdge="BothEdge" LeftMargin="126.5000" RightMargin="126.5000" TopMargin="110.5000" BottomMargin="126.5000" FontSize="17" LabelText="Hiện tại bạn không có GiftCode.  " ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="238.0000" Y="21.0000" />
                    <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                    <Position X="245.5000" Y="137.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="132" G="140" B="220" />
                    <PrePosition X="0.5000" Y="0.5310" />
                    <PreSize X="0.4847" Y="0.0814" />
                    <FontResource Type="Normal" Path="Font/tahoma.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="266.3365" Y="175.0412" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.4932" Y="0.4398" />
                <PreSize X="0.9093" Y="0.6482" />
                <FileData Type="Normal" Path="GiftCodeGUI/_0004_Shape-259-copy-2.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="panelInput" ActionTag="1536160926" VisibleForFrame="False" Tag="223" IconVisible="False" LeftMargin="30.0334" RightMargin="39.9666" TopMargin="169.9426" BottomMargin="188.0574" Scale9Width="470" Scale9Height="40" ctype="ImageViewObjectData">
                <Size X="470.0000" Y="40.0000" />
                <Children>
                  <AbstractNodeData Name="txInput" ActionTag="602130027" Tag="221" IconVisible="False" LeftMargin="4.1111" RightMargin="-12.1111" TopMargin="8.4496" BottomMargin="4.5504" TouchEnable="True" FontSize="17" IsCustomSize="True" LabelText="" PlaceHolderText="Chạm vào đây để nhập" MaxLengthText="10" ctype="TextFieldObjectData">
                    <Size X="478.0000" Y="27.0000" />
                    <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                    <Position X="243.1111" Y="18.0504" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="203" G="204" B="206" />
                    <PrePosition X="0.5173" Y="0.4513" />
                    <PreSize X="1.0170" Y="0.6750" />
                    <FontResource Type="Normal" Path="Font/tahoma.ttf" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="btnOK" ActionTag="-1620060354" Tag="222" IconVisible="False" LeftMargin="169.3365" RightMargin="145.6635" TopMargin="86.5474" BottomMargin="-100.5474" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="118" Scale9Height="32" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
                    <Size X="155.0000" Y="54.0000" />
                    <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                    <Position X="246.8365" Y="-73.5474" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5252" Y="-1.8387" />
                    <PreSize X="0.3298" Y="1.3500" />
                    <TextColor A="255" R="65" G="65" B="70" />
                    <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
                    <PressedFileData Type="Normal" Path="Common/buttonOK.png" Plist="" />
                    <NormalFileData Type="Normal" Path="Common/buttonOK.png" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="265.0334" Y="208.0574" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.4908" Y="0.5228" />
                <PreSize X="0.8704" Y="0.1005" />
                <FileData Type="Normal" Path="GiftCodeGUI/_0005_Layer-2.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="btnGet" ActionTag="813675448" Tag="219" IconVisible="False" LeftMargin="267.1902" RightMargin="36.8098" TopMargin="97.4721" BottomMargin="261.5279" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="206" Scale9Height="17" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
                <Size X="236.0000" Y="39.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="385.1902" Y="281.0279" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.7133" Y="0.7061" />
                <PreSize X="0.4370" Y="0.0980" />
                <TextColor A="255" R="65" G="65" B="70" />
                <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
                <PressedFileData Type="Normal" Path="GiftCodeGUI/tabGet.png" Plist="" />
                <NormalFileData Type="Normal" Path="GiftCodeGUI/tabGet.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="btnInput" ActionTag="1489230105" Tag="218" IconVisible="False" LeftMargin="29.9126" RightMargin="274.0874" TopMargin="97.4721" BottomMargin="261.5279" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="206" Scale9Height="17" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
                <Size X="236.0000" Y="39.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="147.9126" Y="281.0279" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.2739" Y="0.7061" />
                <PreSize X="0.4370" Y="0.0980" />
                <TextColor A="255" R="65" G="65" B="70" />
                <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
                <PressedFileData Type="Normal" Path="GiftCodeGUI/tabInput.png" Plist="" />
                <NormalFileData Type="Normal" Path="GiftCodeGUI/tabInput.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="393.5200" Y="252.9120" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.4919" Y="0.5269" />
            <PreSize X="0.6750" Y="0.8292" />
            <FileData Type="Normal" Path="Common/bgSub.png" Plist="" />
          </AbstractNodeData>
        </Children>
      </ObjectData>
    </Content>
  </Content>
</GameFile>