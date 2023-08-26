import { Preview } from '@creatomate/preview';

$(function () {
  // ============================================
  // CONSTANTS & VARIABLES
  // ============================================
  // This section declares all the important variables used throughout the script.

  let selectedDestination = null; // Track selected destination for the "Click & Replace Interactivity"
  let draggedElementContent = null; // Store the content of the element being dragged

  // ============================================
  // REUSABLE FUNCTION FOR INITIALIZING RESIZABLE
  // ============================================
  function initResizable() {
    $('div[data-resizable="true"].t-scene-content-wrapper').resizable({
      handles: 'e, w',
      start: function (event, ui) {
        // Store the initial width and left position for future comparison
        $(this).data('initialWidth', ui.size.width);
        $(this).data('initialLeft', $(this).position().left);
      },
      resize: function (event, ui) {
        // Adjust the width and position of the internal video block
        const deltaWidth = ui.size.width - $(this).data('initialWidth');
        const deltaLeft = $(this).position().left - $(this).data('initialLeft');

        const $videoBlock = $(this).find('.t-video-block');
        const newVideoBlockLeft = parseInt($videoBlock.css('left')) - deltaLeft;

        $videoBlock.css('left', `${newVideoBlockLeft}px`);
        // Update the initial data for the next iteration
        $(this).data('initialWidth', ui.size.width);
        $(this).data('initialLeft', $(this).position().left);
      },
      stop: function (event, ui) {
        // Clean up: remove data set during resizing
        $(this).removeData('initialWidth').removeData('initialLeft');
      },
    });
  }

  // ============================================
  // PREVIEW INITIALIZATION
  // ============================================
  // This section initializes the Preview library for elements with the attribute 'data-my-attribute'.

  $('[data-my-attribute]').each(function (index, container) {
    const preview = new Preview(container, 'player', 'public-wze2y4kdbo8f5km4pc4mg4on');

    // When the preview is ready, load a specific template
    preview.onReady = async () => {
      await preview.loadTemplate('3098650d-6e33-48b2-aeed-d0a4f4cd2cbc');
    };

    // Listen to input changes and apply modifications to the preview
    $(`[data-input="headline-input${index + 1}"]`).on('input', async function () {
      await preview.setModifications({
        Text: $(this).val(),
      });
    });
  });

  // ============================================
  // CLICK & REPLACE INTERACTIVITY
  // ============================================
  // This section handles the functionality where a user can click on a source element and replace a destination element with its content.

  $(document).on('click', function (event) {
    const target = $(event.target);

    // If clicked on a destination video
    if (target.closest("[data-card-section='destination'] [data-card-block='video']").length) {
      if (selectedDestination) {
        selectedDestination.removeClass('highlighted');
      }

      selectedDestination = target.closest(
        "[data-card-section='destination'] [data-card-block='video']"
      );
      selectedDestination.addClass('highlighted');
    }
    // If clicked on a source video and a destination video is selected
    else if (
      target.closest("[data-card-section='source'] [data-card-block='video']").length &&
      selectedDestination
    ) {
      const contentToReplace = target
        .closest("[data-card-section='source'] [data-card-block='video']")
        .html();
      selectedDestination.html(contentToReplace).removeClass('highlighted');
      selectedDestination = null;
    }
    // If clicked elsewhere, deselect the selected destination if any
    else {
      if (selectedDestination) {
        selectedDestination.removeClass('highlighted');
        selectedDestination = null;
      }
    }
  });

  // ============================================
  // DRAG & DROP FUNCTIONALITY
  // ============================================
  // This section handles the drag and drop functionality for the elements.

  $(document).on('dragstart', function (event) {
    const target = $(event.target);

    // Store the content of the source video being dragged
    if (target.closest("[data-card-section='source'] [data-card-block='video']").length) {
      draggedElementContent = target
        .closest("[data-card-section='source'] [data-card-block='video']")
        .html();
    }
  });

  // Handle the dragover event to allow dropping
  $(document).on('dragover', function (event) {
    event.preventDefault();
  });

  // Handle the drop event to replace content of the destination
  $(document).on('drop', function (event) {
    event.preventDefault();
    const target = $(event.target);

    // Replace the content of the destination video with the dragged content
    if (
      target.closest("[data-card-section='destination'] [data-card-block='video']").length &&
      draggedElementContent
    ) {
      target
        .closest("[data-card-section='destination'] [data-card-block='video']")
        .html(draggedElementContent);
      draggedElementContent = null;
    }
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  // These functions perform certain repetitive tasks throughout the script.

  // Assign positions to scenes based on their order in the timeline
  function assignScenePositions() {
    $('[data-role="timeline"] [data-role="scene"]').each(function (index) {
      $(this).attr('data-role-pos', index + 1);
    });
  }

  // Add between-scenes wrappers for interaction between scenes
  function addBetweenScenesWrapper() {
    const $sceneContainers = $('[data-role="timeline"]').find('[data-role="scene-container"]');
    $sceneContainers.each(function (index) {
      const $sceneContainer = $(this);
      const hasTriggerWrapper = $sceneContainer.find('[data-role-wrapper="trigger"]').length > 0;

      if (!hasTriggerWrapper && index !== $sceneContainers.length - 1) {
        const $betweenScenesTemplate = $(
          '[data-role-wrapper="trigger"][data-role="add-between-scenes-template"]:first'
        )
          .clone()
          .removeClass('hidden-template')
          .removeAttr('data-role');

        $sceneContainer.find('[data-role="scene-content-wrapper"]').after($betweenScenesTemplate);
      }
    });
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  // These are the events triggered by user interactions with the interface.

  // Handle the click event for adding a scene at the end of the timeline
  $('[data-role="add-scene-end"]').on('click', function () {
    const sceneCount = $('[data-role="timeline"]').find('[data-role="scene"]').length;
    const $sceneTemplate = $('[data-role="scene-template"]:first').clone();

    $sceneTemplate.find('[data-role="scene"]').attr('data-role-pos', '');
    $sceneTemplate.removeClass('hidden-template').removeAttr('data-role');
    $sceneTemplate.find('[data-role="add-between-scenes-wrapper"]').css('display', 'none');

    const $parentWrapper = $(this).closest('[data-role-wrapper="add-scene-end"]');
    $parentWrapper.before($sceneTemplate);

    // If this is the second scene being added, also add the between-scenes template
    if (sceneCount === 1) {
      const $betweenScenesTemplate = $(
        '[data-role-wrapper="trigger"][data-role="add-between-scenes-template"]:first'
      )
        .clone()
        .removeClass('hidden-template')
        .removeAttr('data-role');

      $('[data-role="timeline"]')
        .children()
        .first()
        .find('[data-role="scene-content-wrapper"]')
        .after($betweenScenesTemplate);
    }

    assignScenePositions();
    addBetweenScenesWrapper();
    initResizable();
  });

  // Handle the click event for adding a scene between existing scenes
  $(document).on('click', '[data-role="add-between-scenes"]', function () {
    const $sceneTemplate = $('[data-role="scene-template"]:first').clone();
    $sceneTemplate.removeClass('hidden-template').removeAttr('data-role');
    $(this).closest('[data-role-scene="wrapper"]').after($sceneTemplate);
    addBetweenScenesWrapper();
    assignScenePositions();
    initResizable();
  });

  // ============================================
  // ADJUSTING MAX WIDTH
  // ============================================
  // This section adjusts the maximum width of the timeline scroll wrapper based on the visibility of the side panel.

  function adjustMaxWidth() {
    const sidePanelDisplay = $('.t-side-panel').css('display');

    if (sidePanelDisplay === 'block') {
      $('.t-timeline-scroll-wrapper').css('max-width', 'calc(100vw - 25rem)');
    } else {
      $('.t-timeline-scroll-wrapper').css('max-width', 'calc(100vw - 4.5rem)');
    }
  }

  adjustMaxWidth();

  // Observe style changes in the side panel to adjust the max width of the timeline scroll wrapper
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === 'style') {
        adjustMaxWidth();
      }
    });
  });

  observer.observe($('.t-side-panel')[0], {
    attributes: true,
    attributeFilter: ['style'],
  });

  // Adjust max width on window resize
  $(window).on('resize', adjustMaxWidth);

  // ============================================
  // INITIALIZE RESIZABLE ON DOCUMENT READY
  // ============================================
  initResizable();
});
